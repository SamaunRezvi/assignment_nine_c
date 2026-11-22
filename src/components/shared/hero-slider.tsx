'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const SLIDES = [
  { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=2400&q=90', alt: 'A technician reviewing repair schematics and tools', position: 'center 5%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=2400&q=90', alt: 'A verified electrician at a job site', position: 'center 0%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=2400&q=90', alt: 'A technician diagnosing electronics in a repair lab', position: 'center 25%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=2400&q=90', alt: 'A technician testing hardware components', position: 'center 20%', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=2400&q=90', alt: 'A modern kitchen with appliances ready for service', position: 'center', fit: 'cover' },
  { src: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=2400&q=90', alt: 'A repair tool resting on a workbench', position: 'center', fit: 'contain' },
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
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className={slide.fit === 'contain' ? 'object-contain bg-black' : 'object-cover'}
            style={{ objectPosition: slide.position }}
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
    </div>
  );
}
