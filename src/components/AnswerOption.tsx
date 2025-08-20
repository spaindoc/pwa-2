import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

type AnswerOptionProps = {
  className?: string;
  marker: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick: () => void;
  disabled?: boolean;
  answer: string;
};

const answerOptionVariants = cva(
  [
    "flex gap-3 p-2.5 items-center h-[3.75rem] w-full bg-white/[4%] rounded-2xl border cursor-pointer",
    "border-white/20 active:border-white/50",
  ],
  {
    variants: {
      isCorrect: {
        true: "border-green",
        false: "",
      },
      isWrong: {
        true: "border-red",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      isCorrect: false,
      isWrong: false,
      disabled: false,
    },
  }
);

const markerVariants = cva(
  [
    "flex justify-center items-center h-[1.75rem] w-[1.75rem] shrink-0 rounded-full text-xs font-medium",
    "bg-white text-black",
  ],
  {
    variants: {
      isCorrect: {
        true: "bg-green text-black",
        false: "",
      },
      isWrong: {
        true: "bg-red text-black",
        false: "",
      },
      disabled: {
        true: "bg-white/50",
        false: "",
      },
    },
    defaultVariants: {
      isCorrect: false,
      isWrong: false,
      disabled: false,
    },
  }
);

const textVariants = cva(
  [
    "text-base font-normal text-left",
    "text-white",
  ],
  {
    variants: {
      isWrong: {
        true: "text-red",
        false: "",
      },
      disabled: {
        true: "text-white/50",
        false: "",
      },
    },
    defaultVariants: {
      isWrong: false,
      disabled: false,
    },
  }
);

export default function AnswerOption({ 
  className, 
  marker, 
  isCorrect, 
  isWrong, 
  onClick, 
  disabled, 
  answer 
}: AnswerOptionProps) {
  return (
    <button 
      className={twMerge(answerOptionVariants({ isCorrect, isWrong, disabled}), className)}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={twMerge(markerVariants({ isCorrect, isWrong, disabled }))}>
        {marker}
      </div>
      <p className={twMerge(textVariants({ isWrong, disabled }))}>
        {answer}
      </p>
    </button>
  )
}