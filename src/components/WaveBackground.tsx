"use client";

export default function WaveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* CSS-only animated waves - no JS, no main thread work */}
      <svg
        className="absolute bottom-0 w-full wave-svg-1"
        style={{ height: '30%', opacity: 0.15 }}
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        <path
          d="M0,200 Q480,150 960,200 T1920,200 L1920,400 L0,400 Z"
          fill="url(#waveGradient1)"
        >
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M0,200 Q480,150 960,200 T1920,200 L1920,400 L0,400 Z;
              M0,215 Q480,170 960,190 T1920,215 L1920,400 L0,400 Z;
              M0,200 Q480,150 960,200 T1920,200 L1920,400 L0,400 Z
            "
          />
        </path>
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(190, 70%, 50%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(190, 70%, 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="absolute bottom-0 w-full wave-svg-2"
        style={{ height: '25%', opacity: 0.1 }}
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        <path
          d="M0,220 Q480,180 960,220 T1920,220 L1920,400 L0,400 Z"
          fill="url(#waveGradient2)"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0,220 Q480,180 960,220 T1920,220 L1920,400 L0,400 Z;
              M0,240 Q480,200 960,210 T1920,240 L1920,400 L0,400 Z;
              M0,220 Q480,180 960,220 T1920,220 L1920,400 L0,400 Z
            "
          />
        </path>
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(200, 75%, 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(200, 75%, 55%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS-only bubbles - no JS animation loop */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 8 + 5) % 95}%`,
              bottom: '-20px',
              width: `${8 + (i % 4) * 5}px`,
              height: `${8 + (i % 4) * 5}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(100,200,255,0.3), rgba(0,150,255,0.15))',
              border: '1px solid rgba(255,255,255,0.2)',
              opacity: 0.25,
              animation: `bubble-rise ${12 + (i % 5) * 3}s linear infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      {/* Static gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(100,200,255,0.15) 0%, rgba(14,116,144,0.12) 30%, rgba(6,78,96,0.08) 60%, transparent 90%), linear-gradient(180deg, rgba(0,100,150,0.1) 0%, rgba(0,50,100,0.05) 50%, rgba(0,20,40,0.02) 100%)',
        }}
      />

      {/* Light rays using CSS animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`ray-${i}`}
            className="absolute top-0 animate-pulse"
            style={{
              left: `${15 + i * 20}%`,
              width: 80,
              height: '70%',
              background: 'linear-gradient(180deg, rgba(100,200,255,0.04) 0%, transparent 100%)',
              transform: 'skewX(-5deg)',
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes bubble-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.25;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-110vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
