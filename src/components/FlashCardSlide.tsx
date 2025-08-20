import Counter from "./Counter";
import { FlashcardsContent } from "./Flashcards";
import AudioIcon from "./icons/AudioIcon";
import SwipeIcon from "./icons/SwipeIcon";
import BackButton from "./ui/BackButton";
import BookmarkButton from "./ui/BookmarkButton";
import TextArea from "./ui/TextArea";
import Timer from "./Timer";
import Swiper from "swiper";

type FlashcardSlideProps = {
  card: FlashcardsContent;
  isActive: boolean;
  index: number;
  cardsLength: number;
  userInput: string;
  onUserInputChange: (value: string) => void;
  swiper: Swiper | null; 
};

export default function FlashcardSlide({ card, isActive, index, cardsLength, userInput, onUserInputChange, swiper }: FlashcardSlideProps) {
  return (
    <div className="h-full flex flex-col">
      <BackButton
      onClick={() => {
        if (index > 0) {
          swiper?.slidePrev();
        }
      }}
      className="z-10 mt-[3.75rem] mb-6"
    />
    
    <div className="flex-1 flex flex-col justify-center items-center">
      {card.type === 'video' && (
        <div className="w-full h-full">
          <Counter
            count={index}
            length={cardsLength}
          />
        </div>
      )}

      {card.type === 'timer' && (
        <div className="w-full h-full">
          <div className="flex flex-col space-y-4 mb-12">
            <Counter
              count={index}
              length={cardsLength}
            />
            {card.title && (
              <h1 className="text-2xl font-medium text-white leading-tight">
                {card.title}
              </h1>
            )}
            {card.content && (
              <p className="text-white">
                {card.content}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Timer 
              timer={60} 
              className="mx-auto"
            />
          </div>
        </div>
      )}

      {card.type === 'text' && (
        <div className="w-full h-full">
          <div className="flex flex-col mt-24 w-full space-y-4">
            <Counter
              count={index}
              length={cardsLength}
            />
            {card.title && (
              <h1 className="text-2xl font-medium text-white leading-tight">
                {card.title}
              </h1>
            )}
            {card.content && (
              <p className="text-white">
                {card.content}
              </p>
            )}
            {card.audioUrl && (
              <div className="flex justify-center -mx-4">
                <AudioIcon />
              </div>
            )}
          </div>
        </div>
      )}

      {card.type === 'input' && (
        <div className="flex flex-col w-full h-full space-y-4">
            <Counter
              count={index}
              length={cardsLength}
            />
            {card.title && (
              <h1 className="text-2xl font-medium text-white leading-tight">
                {card.title}
              </h1>
            )}
            {card.content && (
              <p className="text-white">
                {card.content}
              </p>
            )}
            <TextArea 
              value={userInput}
              onChange={(e) => onUserInputChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {index === 0 && (
        <div className="flex justify-center mb-[4.125rem]">
          <SwipeIcon />
        </div>
      )}

      <BookmarkButton 
        className="absolute bottom-[2.375rem] right-4"
      />
    </div>
  )
}