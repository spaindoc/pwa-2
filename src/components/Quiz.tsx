"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionCard, { Question } from "./QuestionCard";
import Button from "./ui/Button";
import ChatIcon from "./icons/ChatIcon";
import FireIcon from "./icons/FireIcon";
import ClockIcon from "./icons/ClockIcon";
import HITEIcon from "./icons/HITEIcon";
import PopperCrackerIcon from "./icons/PopperCrackerIcon";
import BackButton from "./ui/BackButton";
import StarButton from "./ui/StarButton";
import TextArea from "./ui/TextArea";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
  cubicBezier,
} from "framer-motion";

const EASE = cubicBezier(0.22, 1, 0.36, 1);
const SHEET_NAME = "PWA-2";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}
type QuizProps = {
  questions: Question[];
  onComplete?: (score: number, totalQuestions: number) => void;
  onFeedbackSubmit?: (rating: number, feedback: string) => void;
  className?: string;
};

export default function Quiz({
  questions,
  onComplete,
  onFeedbackSubmit,
  className,
}: QuizProps) {
  const [answers, setAnswers] = useState<
    Record<string, { answerId: string; isCorrect: boolean }>
  >({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const router = useRouter();

  const currentQuestionId = questions[currentQuestionIndex]?.id;
  const isCurrentQuestionAnswered = currentQuestionId
    ? !!answers[currentQuestionId]
    : false;

  const correctAnswers = useMemo(
    () => Object.values(answers).filter((a) => a.isCorrect).length,
    [answers]
  );
  const allCorrect =
    questions.length > 0 && correctAnswers === questions.length;

  const handleAnswered = (
    questionId: string,
    answerId: string,
    isCorrect: boolean
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answerId, isCorrect },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      onComplete?.(correctAnswers, questions.length);
    } else {
      setShowFeedback(true);
    }
  };

  const handleBack = () => {
    if (showFeedback) {
      setShowFeedback(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else {
      router.push("/flashcard");
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          rating,
          feedback: feedbackText,
          sheet: SHEET_NAME,
          meta: {
            correctAnswers,
            totalQuestions: questions.length,
            path: typeof window !== "undefined" ? window.location.pathname : "",
          },
        }),
      });

      if (!res.ok) {
        // попытаться прочитать сообщение от API, но без any
        let apiMessage = "";
        try {
          const data: unknown = await res.json();
          apiMessage =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "";
        } catch {
          /* ignore json parse */
        }
        throw new Error(apiMessage || `Request failed: ${res.status}`);
      }

      onFeedbackSubmit?.(rating, feedbackText);
      setFeedbackText("");
      setRating(0);
      setShowToast(true);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err) || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  // авто-закрытие тоста
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2400);
    return () => clearTimeout(t);
  }, [showToast]);

  // ================== АНИМАЦИИ (Framer Motion) ==================

  // Stats card (Active Streak)
  const daysMV = useMotionValue(0);
  const [daysVal, setDaysVal] = useState(0);

  useEffect(() => {
    const unsub = daysMV.on("change", (v) => setDaysVal(Math.round(v)));
    return () => unsub();
  }, [daysMV]);

  useEffect(() => {
    if (!(isCompleted && !showFeedback)) return;
    daysMV.set(0);
    const ctrl = animate(daysMV, [0, 6], {
      duration: 1.4,
      ease: EASE,
      delay: 0.4,
    });
    return () => ctrl.stop();
  }, [isCompleted, showFeedback, daysMV]);

  // HITE card numbers (staggered count ups)
  const HITE_TARGET = 1335;
  const hiteMV = useMotionValue(0);
  const [hiteVal, setHiteVal] = useState(0);

  const completedMV = useMotionValue(0);
  const [completedVal, setCompletedVal] = useState(0);

  const streakMV = useMotionValue(0);
  const [streakVal, setStreakVal] = useState(0);

  const correctMV = useMotionValue(0);
  const [correctVal, setCorrectVal] = useState(0);

  const totalTarget = 100 + 7 + (allCorrect ? 15 : 0);
  const totalMV = useMotionValue(0);
  const [totalVal, setTotalVal] = useState(0);

  useEffect(() => {
    const u1 = hiteMV.on("change", (v) => setHiteVal(Math.round(v)));
    const u2 = completedMV.on("change", (v) => setCompletedVal(Math.round(v)));
    const u3 = streakMV.on("change", (v) => setStreakVal(Math.round(v)));
    const u4 = correctMV.on("change", (v) => setCorrectVal(Math.round(v)));
    const u5 = totalMV.on("change", (v) => setTotalVal(Math.round(v)));
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [hiteMV, completedMV, streakMV, correctMV, totalMV]);

  useEffect(() => {
    if (!(isCompleted && !showFeedback)) return;

    const baseDelay = 0.35;

    // Reset
    hiteMV.set(0);
    completedMV.set(0);
    streakMV.set(0);
    correctMV.set(0);
    totalMV.set(0);

    const ctrls: { stop: () => void }[] = [];

    // Completed DTE: 0 -> 100
    ctrls.push(
      animate(completedMV, [0, 100], {
        duration: 1.0,
        ease: EASE,
        delay: baseDelay + 0.1,
      })
    );

    // DTE Streak Multiplier: 0 -> 7
    ctrls.push(
      animate(streakMV, [0, 7], {
        duration: 0.9,
        ease: EASE,
        delay: baseDelay + 0.8,
      })
    );

    // Correct (если все верно): 0 -> 15
    if (allCorrect) {
      ctrls.push(
        animate(correctMV, [0, 15], {
          duration: 0.9,
          ease: EASE,
          delay: baseDelay + 1.5,
        })
      );
    }

    // Total: 0 -> сумма
    ctrls.push(
      animate(totalMV, [0, totalTarget], {
        duration: 1.0,
        ease: EASE,
        delay: baseDelay + (allCorrect ? 2.1 : 1.6),
      })
    );

    // HITE Score: 0 -> 1335
    ctrls.push(
      animate(hiteMV, [0, HITE_TARGET], {
        duration: 1.6,
        ease: EASE,
        delay: baseDelay + (allCorrect ? 2.4 : 1.9),
      })
    );

    return () => ctrls.forEach((c) => c.stop());
  }, [
    isCompleted,
    showFeedback,
    allCorrect,
    totalTarget,
    hiteMV,
    completedMV,
    streakMV,
    correctMV,
    totalMV,
  ]);

  // ================== ЭКРАНЫ ==================

  if (!showFeedback && !isCompleted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <section className={twMerge("flex flex-col flex-1", className)}>
        <div className='flex gap-[0.938rem] mb-[3.375rem] items-center '>
          <BackButton onClick={handleBack} />
          <span className='font-bold text-2xl'>Knowledge Check</span>
        </div>

        <div className='flex-1'>
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswered={handleAnswered}
            className='h-full'
          />
        </div>

        <Button
          className='mt-auto'
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered}
        >
          Next
        </Button>
      </section>
    );
  }

  if (isCompleted && !showFeedback) {
    return (
      <section className={twMerge("flex flex-col flex-1 ", className)}>
        {/* Верхний поздравительный блок */}
        <motion.div
          className='text-center mb-[1.75rem]'
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.div
            className='w-fit mx-auto'
            initial={{ scale: 0.9, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <PopperCrackerIcon />
          </motion.div>
          <motion.h1
            className='text-[32px] font-bold mb-4'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            You Did It!
          </motion.h1>
          <motion.p
            className='text-white/80 '
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            You&apos;ve completed today&apos;s DTE. Your <br /> metrics have now
            changed!
          </motion.p>
        </motion.div>

        {/* ===== STATS CARD ===== */}
        <motion.div
          className='w-full mb-[0.688rem] flex flex-col p-3 bg-black/30 border border-white/20 rounded-2xl overflow-hidden'
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        >
          <motion.div
            initial='hidden'
            animate='show'
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.35 } },
            }}
            className='flex flex-col gap-2'
          >
            {/* Row 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              className='flex flex-row justify-between items-center'
            >
              <span>Active Streak</span>
              <div className='flex flex-row items-center gap-1.5'>
                <motion.span
                  aria-hidden
                  animate={{
                    rotate: [0, -6, 0, 6, 0],
                    scale: [1, 1.06, 1, 1.06, 1],
                  }}
                  transition={{
                    duration: 2.8,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  <FireIcon />
                </motion.span>
                <motion.span
                  className='text-[22px] font-medium tabular-nums'
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                >
                  {daysVal} days
                </motion.span>
              </div>
            </motion.div>

            {/* Row 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              className='flex flex-row justify-between text-sm text-white/80'
            >
              <span>Time spent today:</span>
              <div className='flex flex-row gap-1 items-center'>
                <motion.span
                  aria-hidden
                  animate={{ rotate: [0, -12, 0, 12, 0] }}
                  transition={{
                    duration: 3.0,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  <ClockIcon />
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  1 hour
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ===== HITE SCORE CARD ===== */}
        <motion.div
          className='w-full flex flex-col py-4 px-3 border border-violet rounded-2xl relative overflow-hidden'
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        >
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `url('/hite-score-bg.png')`,
              backgroundSize: "290px 140px",
              backgroundPosition: "right bottom",
              backgroundRepeat: "no-repeat",
              opacity: 0.9,
            }}
          />

          <div className='relative z-10'>
            <div className='flex flex-row justify-between mb-4'>
              <div className='flex items-center gap-1.5'>
                <HITEIcon />
                <span className='font-medium text-lg'>HITE Score</span>
                <div className='font-medium text-[10px] px-1.5 py-1 bg-blue rounded-4xl text-green'>
                  🌱 Trainee
                </div>
              </div>

              <motion.span
                className='font-medium text-2xl tabular-nums'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
              >
                {hiteVal.toLocaleString()}
              </motion.span>
            </div>

            <motion.div
              className='w-full flex flex-col space-y-1.5 font-medium text-sm border-b pb-1 mb-1.5 border-b-white/20'
              initial='hidden'
              animate='show'
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.35 } },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                className='flex flex-row justify-between'
              >
                <span className='text-white/80'>Completed DTE</span>
                <span className='tabular-nums'>+{completedVal}</span>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                className='flex flex-row justify-between'
              >
                <span className='text-white/80'>DTE Streak Multiplier</span>
                <span className='tabular-nums'>+{streakVal}</span>
              </motion.div>

              {allCorrect && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                  className='flex flex-row justify-between'
                >
                  <span className='text-white/80'>
                    Correct Knowledge Check Answer
                  </span>
                  <span className='tabular-nums'>+{correctVal}</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className='flex flex-row justify-between'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: allCorrect ? 1.9 : 1.4,
              }}
            >
              <span>Total</span>
              <span className='font-medium text-sm text-green tabular-nums'>
                +{totalVal} points
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
          className='mt-auto'
        >
          <Button onClick={handleNext} variant='text'>
            Next
          </Button>
        </motion.div>
      </section>
    );
  }

  // ===== FEEDBACK =====
  return (
    <section className={twMerge("flex flex-col flex-1 relative", className)}>
      <BackButton onClick={handleBack} className='mt-1 mb-2' />
      <div className='mx-auto mb-6'>
        <ChatIcon />
      </div>
      <div className='text-center mb-10'>
        <h1 className='font-bold text-[32px] mb-4'>
          What did you think of <br /> today&apos;s training?
        </h1>
        <p className='text-white/80'>Rate your experience</p>
      </div>

      <div className='flex justify-center items-center gap-4 mb-10'>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            onClick={() => setRating(star)}
            active={star > rating}
          />
        ))}
      </div>

      <TextArea
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        size='sm'
        label='Tell us more'
      />

      <Button
        onClick={handleSubmitFeedback}
        className='mt-auto'
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>

      {submitError && (
        <p className='mt-2 text-sm text-red-400'>{submitError}</p>
      )}

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key='feedback-success'
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className='pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+18px)] z-50'
            role='status'
            aria-live='polite'
          >
            <div className='pointer-events-auto flex items-center gap-2 rounded-2xl bg-white text-black px-3.5 py-2 shadow-xl'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='12' cy='12' r='10' fill='#10B981' />
                <path
                  d='M8 12.5l2.5 2.5L16 9.5'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span className='text-sm font-medium'>Feedback submitted</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
