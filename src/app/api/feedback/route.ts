// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSheetsClient() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64;
  if (!b64) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64");
  const credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function quoteA1Sheet(sheetName: string) {
  const safe = sheetName.replace(/'/g, "''");
  return `'${safe}'`;
}

type Body = {
  rating: number;
  feedback: string;
  meta?: Record<string, unknown>;
  /** <- НОВОЕ: название листа (таба) внутри таблицы */
  sheet?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { rating, feedback, meta, sheet }: Body = await req.json();

    if (typeof rating !== "number" || rating < 1 || rating > 5 || typeof feedback !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Missing GOOGLE_SHEETS_SPREADSHEET_ID" }, { status: 500 });
    }

    // если передали sheet — используем его, иначе из env/дефолт
    const sheetFromBody =
      typeof sheet === "string" && sheet.trim().length > 0 ? sheet.trim() : undefined;
    const sheetName = sheetFromBody || process.env.GOOGLE_SHEETS_SHEET_NAME || "Feedback";

    const sheets = getSheetsClient();

    // Создадим лист, если его нет
    const metaRes = await sheets.spreadsheets.get({ spreadsheetId });
    const exists = metaRes.data.sheets?.some((s) => s.properties?.title === sheetName);
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
    }

    // Строка
    const iso = new Date().toISOString();
    const userAgent = req.headers.get("user-agent") || "";
    const row = [iso, rating, feedback, JSON.stringify(meta || {}), userAgent];

    const range = `${quoteA1Sheet(sheetName)}!A:E`;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("Sheets append error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}