'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Slide {
  src: string;
  alt: string;
  position: string;
  fit: 'cover' | 'contain';
  flip?: boolean;
}

// Positions are tuned so each subject stays right of the headline and fully in frame.
const SLIDES: Slide[] = [
  { src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=2400&q=90', alt: 'A verified electrician at a job site', position: '0% 6%', fit: 'cover', flip: true },
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=2400&q=90', alt: 'A technician diagnosing electronics in a repair lab', position: '50% 61%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=2400&q=90', alt: 'A technician reviewing repair schematics and tools', position: '50% 70%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=2400&q=90', alt: 'A modern kitchen with appliances ready for service', position: 'center', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=2400&q=90', alt: 'A repair tool resting on a workbench', position: '100% 50%', fit: 'contain' },
];

const SLIDE_DURATION = 5000;

export function HeroSlider() {
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
          {slide.fit === 'contain' && (
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover blur-2xl brightness-75"
            />
          )}
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className={slide.fit === 'contain' ? 'object-contain' : 'object-cover'}
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
