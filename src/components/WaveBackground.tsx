"use client";

import { useEffect, useState, useMemo } from 'react';

// Generate static bubble positions once
const generateBubbles = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    baseX: (i * 7 + 10) % 90,
    size: 8 + (i % 4) * 6,
    riseSpeed: 0.08 + (i % 3) * 0.04, // Much slower rise speed
    wobblePhase: i * 0.5,
  }));
};

const STATIC_BUBBLES = generateBubbles();

export default function WaveBackground() {
  const [mounted, setMounted] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setMounted(true);

    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;
      setFrame(elapsed * 30);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Memoize calculations to avoid unnecessary re-renders
  const waveData = useMemo(() => {
    const wavePhase1 = Math.sin((frame / 20) * Math.PI) * 15;
    const wavePhase2 = Math.sin((frame / 25 + Math.PI / 3) * Math.PI) * 12;
    const wavePhase3 = Math.sin((frame / 30 + Math.PI / 2) * Math.PI) * 10;
    const wavePhase4 = Math.sin((frame / 35) * Math.PI) * 20;
    const wavePhase5 = Math.sin((frame / 40 + Math.PI / 4) * Math.PI) * 15;
    const wavePhase6 = Math.sin((frame / 45 + Math.PI / 3) * Math.PI) * 12;
    const colorShift = 190 + Math.sin(frame / 40) * 10;
    return { wavePhase1, wavePhase2, wavePhase3, wavePhase4, wavePhase5, wavePhase6, colorShift };
  }, [frame]);

  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none z-0" />;
  }

  const { wavePhase1, wavePhase2, wavePhase3, wavePhase4, wavePhase5, wavePhase6, colorShift } = waveData;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* SVG Waves - no CLS issues */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ height: '30%', opacity: 0.15 }}
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${200 + wavePhase1}
             Q480,${150 + wavePhase2} 960,${200 + wavePhase3}
             T1920,${200 + wavePhase1}
             L1920,400 L0,400 Z`}
          fill="url(#waveGradient1)"
        />
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${colorShift}, 70%, 50%)`} stopOpacity="0.4" />
            <stop offset="100%" stopColor={`hsl(${colorShift}, 70%, 50%)`} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="absolute bottom-0 w-full"
        style={{ height: '25%', opacity: 0.1 }}
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${220 + wavePhase4}
             Q480,${180 + wavePhase5} 960,${220 + wavePhase6}
             T1920,${220 + wavePhase4}
             L1920,400 L0,400 Z`}
          fill="url(#waveGradient2)"
        />
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${colorShift + 10}, 75%, 55%)`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`hsl(${colorShift + 10}, 75%, 55%)`} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bubbles using CSS transform instead of left/top - prevents CLS */}
      {STATIC_BUBBLES.map((bubble) => {
        const wobble = Math.sin(frame / 10 + bubble.wobblePhase) * 3;
        const yOffset = (frame * bubble.riseSpeed + bubble.id * 20) % 130;
        const bubbleOpacity = 0.3 + Math.sin(frame / 40 + bubble.id) * 0.15;

        return (
          <div
            key={bubble.id}
            className="absolute rounded-full will-change-transform"
            style={{
              // Fixed position to prevent CLS - only transform changes
              left: `${bubble.baseX}%`,
              bottom: 0,
              width: bubble.size,
              height: bubble.size,
              // Use transform for animation - doesn't cause layout shift
              transform: `translate(${wobble}%, ${-yOffset}vh)`,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(100,200,255,0.4), rgba(0,150,255,0.2))`,
              opacity: bubbleOpacity,
              boxShadow: `0 0 ${bubble.size * 2}px rgba(100,200,255,0.4), inset -2px -2px ${bubble.size / 2}px rgba(255,255,255,0.6)`,
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        );
      })}

      {/* Static gradient overlay - no CLS */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(100,200,255,0.15) 0%, rgba(14,116,144,0.12) 30%, rgba(6,78,96,0.08) 60%, transparent 90%), linear-gradient(180deg, rgba(0,100,150,0.1) 0%, rgba(0,50,100,0.05) 50%, rgba(0,20,40,0.02) 100%)`,
        }}
      />

      {/* Light rays using CSS animation instead of JS */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`ray-${i}`}
            className="absolute top-0 animate-pulse"
            style={{
              left: `${15 + i * 20}%`,
              width: 80,
              height: '70%',
              background: `linear-gradient(180deg, rgba(100,200,255,0.04) 0%, transparent 100%)`,
              transform: 'skewX(-5deg)',
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
