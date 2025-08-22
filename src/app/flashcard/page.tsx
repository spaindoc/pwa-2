"use client";

import Flashcards, { FlashcardsContent } from "@/components/Flashcards";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FlashcardPage() {
  const [currentBgImage, setCurrentBgImage] = useState("");
  const router = useRouter();

  const flashcards: FlashcardsContent[] = [
    {
      id: "f1",
      type: "timer",
      title: "Strength You Can Trust",
      content:
        "Use this time to visualize a recent moment when you competed with clarity and confidence. Play the scene back in your mind. What were you relying on internally to hold that space?",
      backgroundImage: "/timer-bg.png",
    },
    {
      id: "f2",
      type: "text",
      title: "Strength You Can Trust",
      content:
        "Confidence that holds over time usually has real experiences behind it. These are the moments where you kept your composure, reset after a mistake, or competed with focus even when things were difficult. The way you respond in those situations shapes your sense of belief. Athletes often describe their strongest confidence as something they can trace back to effort, steadiness, or recovery. That kind of strength is worth paying attention to.",
      backgroundImage: "/bg-video.mp4", // ⬅️ это будет видео-фон
    },
    {
      id: "f3",
      type: "input",
      title: "Strength You Can Trust",
      content:
        "Think about how you can return to that internal anchor the next time things feel uncertain. What does that version of you pay attention to? What needs to stay in focus?",
      backgroundImage: "/input-bg.png",
    },
  ];

  useEffect(() => {
    if (flashcards.length > 0) {
      setCurrentBgImage(flashcards[0].backgroundImage || "/video-bg.png");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlideChange = (index: number) => {
    const newBg = flashcards[index]?.backgroundImage || "/video-bg.png";
    setCurrentBgImage(newBg);
  };

  const handleComplete = () => {
    router.push("/quiz");
  };

  // простая проверка — является ли src видео
  const isVideoSrc = (src: string) => /\.mp4$|\.webm$|\.ogg$/i.test(src ?? "");

  return (
    <div className='w-full h-full flex justify-center'>
      <div className='min-h-screen max-w-md relative overflow-hidden'>
        {/* Фон со слоями (каждая карточка — свой слой). Плавный фейд между слоями */}
        <div className='absolute inset-0'>
          {flashcards.map((card) => {
            const src = card.backgroundImage || "/video-bg.png";
            const active = src === currentBgImage;
            const video = isVideoSrc(src);

            return (
              <div
                key={card.id}
                aria-hidden
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  active ? "opacity-100" : "opacity-0"
                } pointer-events-none`}
              >
                {video ? (
                  <>
                    {/* Само видео — блюрим его, чтобы не зависеть от поддержки backdrop-filter. 
                        scale-110 убирает артефакты у краёв после blur */}
                    <video
                      className='absolute inset-0 w-full h-full object-cover filter blur-[10px] scale-110'
                      src={src}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    {/* Лёгкая затемняющая вуаль сверху для читаемости контента */}
                    <div className='absolute inset-0 bg-black/30' />
                  </>
                ) : (
                  <div
                    className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                    style={{ backgroundImage: `url("${src}")` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Контент над фоном */}
        <div className='z-10 relative'>
          <div className='h-screen flex flex-col'>
            <Flashcards
              cards={flashcards}
              onComplete={handleComplete}
              onSlideChange={handleSlideChange}
              className='flex-1'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
