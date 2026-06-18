'use client';

import React, { useEffect, useState } from 'react';
import styles from './HeartsBackground.module.css';

interface Heart {
  id: number;
  x: number;       // percentage position from left
  size: number;    // font size / width in pixels
  delay: number;   // animation delay in seconds
  duration: number;// animation duration in seconds
  opacity: number; // visual opacity
  rotation: number;// initial random rotation
  char: string;    // specific heart character
}

export default function HeartsBackground() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const heartEmojis = ['❤️', '💖', '💗', '💓', '💕'];
    // Generate hearts on the client side only to prevent Next.js SSR hydration mismatch
    const generatedHearts: Heart[] = Array.from({ length: 25 }).map((_, index) => ({
      id: index,
      x: Math.random() * 100,
      size: Math.random() * 18 + 12, // sizes between 12px and 30px
      delay: Math.random() * 8,       // staggered entry delays
      duration: Math.random() * 10 + 10, // speed variations between 10s and 20s
      opacity: Math.random() * 0.25 + 0.65, // bolder opacity (0.65 to 0.90)
      rotation: Math.random() * 360,
      char: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
    }));
    setHearts(generatedHearts);
  }, []);

  return (
    <div className={styles.heartsContainer} aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className={styles.heart}
          style={{
            left: `${heart.x}%`,
            fontSize: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            opacity: heart.opacity,
            transform: `rotate(${heart.rotation}deg)`,
          }}
        >
          {heart.char}
        </span>
      ))}
    </div>
  );
}
