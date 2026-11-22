'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const RADIUS = 136;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HeroScrollRing() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1));
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 300 300">
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-primary-foreground/15"
        />
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-primary-foreground/20 sm:h-[22rem] sm:w-[22rem]">
        <Image
          src="https://i.ibb.co/W4VxJVfZ/3.jpg"
          alt="A technician ready to fix your device"
          fill
          sizes="(min-width: 640px) 22rem, 16rem"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
