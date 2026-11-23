'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Slide {
  src: string;
  // Key under home.slides in the message catalog.
  alt: string;
  position: string;
  flip?: boolean;
}

// Positions are tuned so each subject stays right of the headline and fully in frame.
const SLIDES: Slide[] = [
  { src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=2400&q=90', alt: 'electrician', position: '0% 6%', flip: true },
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=2400&q=90', alt: 'lab', position: '50% 61%' },
  { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=2400&q=90', alt: 'schematics', position: '50% 70%' },
  { src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=2400&q=90', alt: 'kitchen', position: 'center' },
  { src: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=2400&q=90', alt: 'switchBox', position: '0% 33%', flip: true },
];

const SLIDE_DURATION = 5000;

export function HeroSlider() {
  const t = useTranslations('home.slides');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
          aria-hidden={i !== active}
        >
          <Image
            src={slide.src}
            alt={t(slide.alt)}
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: slide.position,
              transform: slide.flip ? 'scaleX(-1)' : undefined,
            }}
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 via-40% to-transparent to-75%" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
    </div>
  );
}
