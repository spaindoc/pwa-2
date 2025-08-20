"use client"

import Quiz from "@/components/Quiz";
import { Question } from "@/components/QuestionCard";

export default function KnowledgeCheckPage() {
  const questions: Question[] = [
    {
      id: "q1",
      text: "What helps reinforce your confidence during a rough patch?",
      answers: [
        { id: "a1", text: "Pushing through without reflection" },
        { id: "a2", text: "Trusting the work you've put in" },
        { id: "a3", text: "Focusing on what others think" },
      ],
      correctAnswerId: "a3",
    }
  ];

  const handleQuizComplete = (score: number, total: number) => {
    console.log(`Quiz completed with score: ${score}/${total}`);
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log(`Feedback submitted: ${rating}/5 stars`);
    console.log(`Comments: ${feedback}`);
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />
        
        <div className="relative z-10 h-dvh px-4 pt-[3.75rem] pb-[3.125rem]">
          <div className="h-full w-full flex flex-col">
            <Quiz 
              questions={questions} 
              onComplete={handleQuizComplete} 
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}