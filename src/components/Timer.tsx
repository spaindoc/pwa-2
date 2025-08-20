import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { twMerge } from "tailwind-merge";
import StartButton from './ui/StartButton';

interface TimerProps {
  timer: number; // Time in seconds
  onComplete?: () => void;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ timer, onComplete, className }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const progressDotRef = useRef<SVGCircleElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isAnimating = useRef(false);

  const size = 274;
  const strokeWidth = 10;
  const innerSize = 260;
  const radius = (innerSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (isRunning && currentTime < timer) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= timer - 1) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            return timer;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentTime, timer, onComplete]);

  useEffect(() => {
    if (progressCircleRef.current && progressDotRef.current) {
      const progress = (currentTime / timer) * 100;
      const strokeDashoffset = circumference - (progress / 100) * circumference;
      const angle = (progress * 3.6 - 90) * Math.PI / 180;
      const dotX = size / 2 + radius * Math.cos(angle);
      const dotY = size / 2 + radius * Math.sin(angle);

      gsap.to(progressCircleRef.current, {
        strokeDashoffset: strokeDashoffset,
        duration: 0.8,
        ease: "power2.out"
      });

      gsap.to(progressDotRef.current, {
        cx: dotX,
        cy: dotY,
        duration: 0.8,
        ease: "power2.out"
      });
    }
    
    if (isFirstRender.current && currentTime > 0) {
      isFirstRender.current = false;
    }
  }, [currentTime, timer, circumference, radius, size]);

  useEffect(() => {
    if (timerContainerRef.current && isRunning && currentTime === 0) {
      gsap.fromTo(timerContainerRef.current, 
        { 
          scale: 0.4,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isRunning]);

  const handleToggle = () => {
    if (isAnimating.current) return;
    
    if (currentTime === 0 && !isRunning) {
      if (buttonRef.current) {
        isAnimating.current = true;
        gsap.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.set(buttonRef.current, { scale: 1 });
            isAnimating.current = false;
          }
        });
      }
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getState = () => {
    if (currentTime === 0 && !isRunning) return 'initial';
    if (isComplete) return 'complete';
    if (isRunning) return 'running';
    return 'paused';
  };

  const state = getState();

  return (
    <div 
      className={twMerge("relative inline-block", className)} 
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="block"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7766DA" />
            <stop offset="100%" stopColor="#5241B7" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
        />
        
        {state !== 'initial' && (
          <circle
            ref={progressCircleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
        )}

        <g fill="#FFFFFF">
          <rect 
            x={size / 2 - 2} 
            y={0} 
            width="4" 
            height="24" 
            rx="2"
          />
          <rect 
            x={size - 24} 
            y={size / 2 - 2} 
            width="24" 
            height="4" 
            rx="2"
          />
          <rect 
            x={size / 2 - 2} 
            y={size - 24} 
            width="4" 
            height="24" 
            rx="2"
          />
          <rect 
            x={0} 
            y={size / 2 - 2} 
            width="24" 
            height="4" 
            rx="2"
          />
        </g>

        {state !== 'initial' && (
          <circle
            ref={progressDotRef}
            cx={size / 2}
            cy={size / 2 - radius}
            r="12"
            fill="#FFFFFF"
          />
        )}
      </svg>

      <div 
        ref={timerContainerRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {state === 'initial' ? (
          <StartButton
            ref={buttonRef}
            onClick={handleToggle}
          />
        ) : (
          <button 
            ref={buttonRef}
            className="bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors w-[180px] h-[180px]"
            onClick={handleToggle}
          >
            <span 
              className="text-black text-center font-['DM_Sans',sans-serif] text-[40px] leading-[52px] tracking-[2.23602px] font-bold"
            >
              {formatTime(currentTime)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;