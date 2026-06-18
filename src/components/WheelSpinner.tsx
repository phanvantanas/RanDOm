'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { SoundManager } from './SoundManager';
import styles from './WheelSpinner.module.css';
import { Play } from 'lucide-react';

interface WheelItem {
  id: string;
  name: string;
  color: string;
  categoryId: string;
}

interface WheelSpinnerProps {
  items: WheelItem[];
  onSpinComplete: (winningItem: WheelItem) => void | Promise<void>;
}

// Function to calculate text color (black or white) based on background brightness
function getContrastColor(hexColor: string): string {
  let r = 128, g = 128, b = 128;
  const cleanHex = hexColor.replace('#', '').trim();

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (hexColor.startsWith('rgb')) {
    const rgbValues = hexColor.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      r = parseInt(rgbValues[0]);
      g = parseInt(rgbValues[1]);
      b = parseInt(rgbValues[2]);
    }
  }

  // YIQ formula for contrast
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 140) ? '#0f172a' : '#f8fafc';
}

export default function WheelSpinner({ items, onSpinComplete }: WheelSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rotationAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Redraw the wheel whenever items or rotation changes
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width / dpr;
    const center = size / 2;
    const radius = center - 15; // padding for pointer and glow

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
      // Draw placeholder circle
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Thêm lựa chọn...', center, center);
      return;
    }

    const arcSize = (2 * Math.PI) / items.length;

    // Draw wheel segments
    items.forEach((item, index) => {
      const startAngle = index * arcSize + angle;
      const endAngle = startAngle + arcSize;

      // Draw segment slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = item.color;
      ctx.fill();

      // Stroke segment boundary
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw label text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arcSize / 2);

      // Label styling
      ctx.fillStyle = getContrastColor(item.color);
      const fontSize = items.length > 12 ? '11px' : items.length > 8 ? '13px' : '15px';
      ctx.font = `bold ${fontSize} system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Truncate text if too long
      const text = item.name.length > 12 ? item.name.slice(0, 10) + '...' : item.name;
      ctx.fillText(text, radius - 25, 0);
      ctx.restore();
    });

    // Draw Outer Rim Glow & Ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center circular pin
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw small inner metallic dot
    ctx.beginPath();
    ctx.arc(center, center, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  };

  // Adjust canvas for High-DPI screens
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.width * dpr; // maintain square ratio

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawWheel(rotationAngleRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    SoundManager.playTick(); // resume context on user gesture

    const spinDuration = 4500; // 4.5 seconds
    const startTimestamp = performance.now();
    const startAngle = rotationAngleRef.current % (2 * Math.PI);

    // Pick a random index to win
    const winningIndex = Math.floor(Math.random() * items.length);

    // Mathematics to calculate the target angle that places winningIndex under the top pointer (at 3*PI/2)
    const arcSize = (2 * Math.PI) / items.length;
    const targetPointerAngle = (winningIndex + 0.5) * arcSize;
    const finalAngleOffset = (3 * Math.PI / 2) - targetPointerAngle;

    // Spin at least 5 full rotations (10 * Math.PI)
    const fullSpins = 6 * (2 * Math.PI);
    const targetAngle = startAngle + fullSpins + (finalAngleOffset - startAngle % (2 * Math.PI));

    // Keep track of the last crossed segment index for boundary ticking
    let lastCrossedIndex = -1;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Cubic ease-out deceleration curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

      rotationAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Ticker boundary crossing logic
      const currentPointerAngleOnWheel = ((3 * Math.PI / 2) - currentAngle) % (2 * Math.PI);
      const adjustedAngle = currentPointerAngleOnWheel < 0 
        ? currentPointerAngleOnWheel + 2 * Math.PI 
        : currentPointerAngleOnWheel;
      const currentSegmentIndex = Math.floor(adjustedAngle / arcSize);

      if (currentSegmentIndex !== lastCrossedIndex && progress < 0.98) {
        SoundManager.playTick();
        lastCrossedIndex = currentSegmentIndex;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        SoundManager.playCelebration();

        // Confetti pop!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Trigger parent callback
        const winner = items[winningIndex];
        onSpinComplete(winner);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.wheelWrapper}>
        {/* Fixed Top Pointer */}
        <div className={styles.pointer}></div>

        {/* Canvas */}
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Dynamic Center Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className={`${styles.spinButton} ${isSpinning ? styles.spinning : ''}`}
          aria-label="Spin the wheel"
        >
          <Play className={`${styles.spinIcon} ${isSpinning ? styles.hide : ''}`} />
          <span className={isSpinning ? styles.spinningText : ''}>
            {isSpinning ? 'QUAY...' : 'SPIN'}
          </span>
        </button>
      </div>
    </div>
  );
}
