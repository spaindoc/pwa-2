"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { twMerge } from "tailwind-merge";

import "swiper/css";
import "swiper/css/pagination";
import FlashcardSlide from "./FlashCardSlide";

export type FlashcardsContent = {
  id: string;
  type: "video" | "timer" | "text" | "input";
  title?: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  backgroundImage?: string;
};

type FlashcardsProps = {
  cards: FlashcardsContent[];
  onComplete?: () => void;
  onSlideChange?: (index: number) => void;
  className?: string;
};

export default function Flashcards({
  cards,
  onComplete,
  onSlideChange,
  className,
}: FlashcardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentCardIndex(swiper.activeIndex);
    onSlideChange?.(swiper.activeIndex);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  if (!cards.length) return null;

  return (
    <section className={twMerge("h-full", className)}>
      <Swiper
        direction='vertical'
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={{ enabled: true, forceToAxis: true }}
        keyboard={{ enabled: true }}
        modules={[Pagination, Mousewheel, Keyboard]}
        onSwiper={setSwiperInstance}
        onSlideChange={handleSlideChange}
        className='h-full'
        style={
          {
            "--swiper-pagination-color": "#ffffff",
            "--swiper-pagination-bullet-inactive-color": "#ffffff40",
          } as React.CSSProperties
        }
      >
        {cards.map((card, index) => (
          <SwiperSlide key={card.id} className='h-full px-4'>
            <FlashcardSlide
              card={card}
              isActive={index === currentCardIndex}
              index={index}
              cardsLength={cards.length} // последний индекс (как у тебя)
              userInput={userInput}
              onUserInputChange={setUserInput}
              swiper={swiperInstance}
              onComplete={onComplete}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
