"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Sparkles, Timer, Star } from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";

interface StarData {
  id: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
}

interface ConfettiData {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export default function ChristmasDiscount() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [stars, setStars] = useState<StarData[]>([]);
  const [confetti, setConfetti] = useState<ConfettiData[]>([]);

  useEffect(() => {
    // Generate static stars once
    const newStars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: Math.random() * 50,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
    }));
    setStars(newStars);

    // Generate confetti particles
    const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7", "#f472b6"];
    const newConfetti = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }));
    setConfetti(newConfetti);
  }, []);

  useEffect(() => {
    const endDate = new Date("2026-01-10T23:59:59");

    const timer = setInterval(() => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-1 shadow-2xl">
        {/* Sparkle Background Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute text-[#ffd700] animate-pulse",
                i % 2 === 0 ? "h-5 w-5" : "h-8 w-8"
              )}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center justify-between gap-6 rounded-[22px] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-8 sm:flex-row sm:px-10 sm:py-10 overflow-hidden">

            {/* Falling Confetti Animation */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {confetti.map((piece) => (
                <div
                  key={`confetti-${piece.id}`}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${piece.left}%`,
                    top: "-10px",
                    backgroundColor: piece.color,
                    animationDuration: `${piece.duration}s`,
                    animationDelay: `${piece.delay}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>

            {/* Twinkling Stars */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {stars.map((star, i) => (
                <Star
                  key={`star-${star.id}`}
                  className={cn(
                    "absolute text-[#ffd700] animate-pulse fill-[#ffd700] drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]",
                    i % 3 === 0 ? "h-2 w-2 opacity-90" : i % 2 === 0 ? "h-1.5 w-1.5 opacity-70" : "h-1 w-1 opacity-50"
                  )}
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    animationDuration: `${star.duration}s`,
                    animationDelay: `${star.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Subtle 2026 Background Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-[120px] sm:text-[180px] font-black text-white/5 select-none">
                2026
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
               <div className="bg-[#ffd700]/20 p-2 rounded-full backdrop-blur-sm border border-[#ffd700]/30 shadow-lg shadow-[#ffd700]/20">
                 <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                   <Image
                     src="/2026.gif"
                     alt="2026 New Year"
                     fill
                     className="object-contain rounded-full"
                     unoptimized
                   />
                 </div>
               </div>
               <div className="flex flex-col gap-4 text-center sm:text-left">
                 <div className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#ffd700]/20 px-4 py-1.5 text-sm font-bold text-[#ffd700] backdrop-blur-md sm:self-start border border-[#ffd700]/30">
                   <PartyPopper className="h-4 w-4" />
                   <span>New Year Special Offer</span>
                 </div>
                 
                 <div className="space-y-1">
                   <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                     Get <span className="text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-pulse">50% OFF</span> on all plans
                   </h2>
                   <p className="max-w-md text-lg font-medium text-blue-100">
                     Start 2026 strong with our limited time New Year deal.
                   </p>
                 </div>
               </div>
            </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="flex gap-3 text-center">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#ffd700]/10 backdrop-blur-md border border-[#ffd700]/30 text-2xl font-bold text-white shadow-lg shadow-[#ffd700]/10">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-blue-200">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-[#ffd700] mt-2">
              <Timer className="h-4 w-4" />
              Offer ends soon
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
