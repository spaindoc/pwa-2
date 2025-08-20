"use client"

import { useState } from "react";
import AnswerOption from "./AnswerOption";

export type Answer = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
};

type QuestionCardProps = {
  question: Question;
  onAnswered: (questionId: string, answerId: string, isCorrect: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export default function QuestionCard({
  question,
  onAnswered,
  className,
  disabled = false,
}: QuestionCardProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const isAnswered = selectedAnswerId !== null;

  const handleSelectAnswer = (answerId: string) => {
    if (isAnswered || disabled) return;
    
    setSelectedAnswerId(answerId);
    const isCorrect = answerId === question.correctAnswerId;
    onAnswered(question.id, answerId, isCorrect);
  };

  return (
    <div className={`${className || ""}`}>
      <h3 className="text-xl font-medium text-white mb-[1.875rem]">{question.text}</h3>
      
      <div className="space-y-3">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswerId === answer.id;
          const isCorrect = isSelected && answer.id === question.correctAnswerId;
          const isWrong = isSelected && answer.id !== question.correctAnswerId;
          const isOptionDisabled = (isAnswered && !isSelected) || disabled;
          
          return (
            <AnswerOption
              key={answer.id}
              marker={String.fromCharCode(65 + index)}
              answer={answer.text}
              isCorrect={isCorrect}
              isWrong={isWrong}
              onClick={() => handleSelectAnswer(answer.id)}
              disabled={isOptionDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}