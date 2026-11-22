'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const SLIDES = [
  { src: 'https://i.ibb.co/7JwBhNLr/1.jpg', alt: 'A technician reviewing repair schematics and tools' },
  { src: 'https://i.ibb.co/fGqF0vWc/2.jpg', alt: 'A verified electrician at a job site' },
  { src: 'https://i.ibb.co/Mx4W2Wgq/3.jpg', alt: 'A technician diagnosing electronics in a repair lab' },
  { src: 'https://i.ibb.co/Psgx4wtM/4.jpg', alt: 'A technician testing hardware components' },
  { src: 'https://i.ibb.co/Kc1NLWh5/7.jpg', alt: 'A modern kitchen with appliances ready for service' },
  { src: 'https://i.ibb.co/Qv8Vjz5s/9.jpg', alt: 'A repair tool resting on a workbench' },
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
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-4">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? 'w-6 bg-accent' : 'w-1.5 bg-primary-foreground/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
