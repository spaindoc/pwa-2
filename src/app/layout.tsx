import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dmSans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${dmSans.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
