"use client";

import { useState } from "react";
import QuestionCard, { Question } from "./QuestionCard";
import Button from "./ui/Button";
import ChatIcon from "./icons/ChatIcon";
import FireIcon from "./icons/FireIcon";
import ClockIcon from "./icons/ClockIcon";
import HITEIcon from "./icons/HITEIcon";
import PopperCrackerIcon from "./icons/PopperCrackerIcon";
import { twMerge } from "tailwind-merge";
import BackButton from "./ui/BackButton";
import StarButton from "./ui/StarButton";
import TextArea from "./ui/TextArea";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const currentQuestionId = questions[currentQuestionIndex]?.id;
  const isCurrentQuestionAnswered = currentQuestionId
    ? !!answers[currentQuestionId]
    : false;

  const correctAnswers = Object.values(answers).filter(
    (a) => a.isCorrect
  ).length;

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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(correctAnswers, questions.length);
      }
    } else {
      setShowFeedback(true);
    }
  };

  const handleBack = () => {
    if (showFeedback) {
      setShowFeedback(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.push("/flashcard");
    }
  };

  const handleSubmitFeedback = () => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(rating, feedbackText);
    }
  };

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
      <section className={twMerge("flex flex-col flex-1 mt-6", className)}>
        <div className='text-center mb-[3.75rem]'>
          <div className='w-fit mx-auto'>
            <PopperCrackerIcon />
          </div>
          <h1 className='text-[32px] font-bold mb-4'>You Did It!</h1>
          <p className='text-white/80 '>
            You&apos;ve completed today&apos;s DTE. Your <br /> metrics have now
            changed!
          </p>
        </div>

        <div className='w-full mb-[0.688rem] flex flex-col p-3 bg-black/30 border border-white/20 rounded-2xl'>
          <div className='flex flex-row justify-between items-center'>
            Active Streak
            <div className='flex flex-row items-center gap-1.5'>
              <FireIcon />
              <span className='text-[22px] font-medium'>6 days</span>
            </div>
          </div>
          <div className='flex flex-row justify-between text-sm text-white/80'>
            Time spent today:
            <div className='flex flex-row gap-1 items-center'>
              <ClockIcon />1 hour
            </div>
          </div>
        </div>

        <div className='w-full flex flex-col py-4 px-3 border border-violet rounded-2xl relative overflow-hidden '>
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
              <span className='font-medium text-2xl'>1,335</span>
            </div>

            <div className='w-full flex flex-col space-y-1.5 font-medium text-sm border-b pb-1 mb-1.5 border-b-white/20'>
              <div className='flex flex-row justify-between'>
                <span className='text-white/80'>Completed DTE</span>
                +100
              </div>
              <div className='flex flex-row justify-between'>
                <span className='text-white/80'>DTE Streak Multiplier</span>
                +7
              </div>
              {questions.length === correctAnswers && (
                <div className='flex flex-row justify-between'>
                  <span className='text-white/80'>
                    Correct Knowledge Check Answer
                  </span>
                  +15
                </div>
              )}
            </div>

            <div className='flex flex-row justify-between'>
              Total
              <span className='font-medium text-sm text-green'>+122points</span>
            </div>
          </div>
        </div>

        <Button onClick={handleNext} variant='text' className='mt-auto'>
          Next
        </Button>
      </section>
    );
  }

  return (
    <section className={twMerge("flex flex-col flex-1", className)}>
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

      <Button onClick={handleSubmitFeedback} className='mt-auto'>
        Submit
      </Button>
    </section>
  );
}
