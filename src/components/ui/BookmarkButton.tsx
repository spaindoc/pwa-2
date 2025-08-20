import { twMerge } from "tailwind-merge";
import React from "react";
import BookmarkIcon from "../icons/BookmarkIcon";

type BookmarkButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const BookmarkButton = React.forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  ({ className, onClick, disabled, ...props }, ref) => (
    <button 
      className={twMerge(
        "bg-black/30 border border-white/30 rounded-full flex items-center justify-center cursor-pointer transition-colors w-12 h-12",
        disabled ? "" : "",
        className
      )}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <BookmarkIcon />
    </button>
  )
);

export default BookmarkButton;