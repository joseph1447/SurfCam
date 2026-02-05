import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export const SurferSnapLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth, organic entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 }, // Smooth, no bounce
  });

  // Staggered letter animations
  const text = "SANTA TERESA".split("");
  const subtitle = "SURF CAM".split("");

  // Organic wave path animation
  const wavePhase1 = Math.sin((frame / 20) * Math.PI) * 15;
  const wavePhase2 = Math.sin((frame / 25 + Math.PI / 3) * Math.PI) * 12;
  const wavePhase3 = Math.sin((frame / 30 + Math.PI / 2) * Math.PI) * 10;

  // Sophisticated color palette (less saturated)
  const colorShift = interpolate(
    Math.sin(frame / 40),
    [-1, 1],
    [190, 210]
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%,
          rgba(14, 116, 144, 0.15) 0%,
          rgba(6, 78, 96, 0.1) 40%,
          transparent 70%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Organic wave background */}
      <svg
        style={{
          position: 'absolute',
          bottom: -20,
          width: '100%',
          height: '40%',
          opacity: 0.2,
        }}
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${75 + wavePhase1}
             Q125,${50 + wavePhase2} 250,${75 + wavePhase3}
             T500,${75 + wavePhase1}
             L500,150 L0,150 Z`}
          fill="url(#waveGradient)"
        />
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${colorShift}, 70%, 50%)`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`hsl(${colorShift}, 70%, 50%)`} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main title - Staggered letter entrance */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* SANTA TERESA with organic spacing */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            position: 'relative',
          }}
        >
          {text.map((letter, i) => {
            const letterSpring = spring({
              frame: frame - i * 2,
              fps,
              config: { damping: 200 },
            });

            const letterY = interpolate(
              letterSpring,
              [0, 1],
              [50, 0],
              {
                extrapolateRight: 'clamp',
                easing: Easing.inOut(Easing.ease),
              }
            );

            const letterOpacity = interpolate(
              letterSpring,
              [0, 1],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );

            // Subtle wave motion for each letter
            const waveY = Math.sin((frame / 20) + (i * 0.3)) * 3;

            return (
              <span
                key={i}
                style={{
                  fontSize: letter === ' ' ? '28px' : '48px',
                  fontWeight: '900',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: `hsl(${colorShift + i * 3}, 85%, 80%)`,
                  transform: `translateY(${letterY + waveY}px)`,
                  opacity: letterOpacity,
                  textShadow: `0 0 20px rgba(100, 200, 255, 0.8),
                              0 0 40px rgba(100, 200, 255, 0.5),
                              0 ${4 + Math.abs(waveY)}px ${10 + Math.abs(waveY)}px rgba(0, 150, 200, 0.6)`,
                  display: 'inline-block',
                  lineHeight: 1,
                  letterSpacing: '4px',
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* SURF CAM subtitle with elegant spacing */}
        <div
          style={{
            display: 'flex',
            gap: '18px',
            marginTop: '8px',
          }}
        >
          {subtitle.map((letter, i) => {
            const subtitleSpring = spring({
              frame: frame - 20 - i * 1.5,
              fps,
              config: { damping: 200 },
            });

            const letterScale = interpolate(
              subtitleSpring,
              [0, 1],
              [0.5, 1],
              { extrapolateRight: 'clamp' }
            );

            const letterOpacity = interpolate(
              subtitleSpring,
              [0, 1],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );

            return (
              <span
                key={i}
                style={{
                  fontSize: letter === ' ' ? '20px' : '28px',
                  fontWeight: '600',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: `hsl(${colorShift + 10}, 80%, 75%)`,
                  transform: `scale(${letterScale})`,
                  opacity: letterOpacity,
                  textShadow: `0 0 15px rgba(100, 200, 255, 0.6),
                              0 2px 6px rgba(0, 150, 200, 0.4)`,
                  display: 'inline-block',
                  lineHeight: 1,
                  letterSpacing: '8px',
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>

      {/* Organic floating particles */}
      {[...Array(12)].map((_, i) => {
        const particleEntrance = spring({
          frame: frame - 10 - i * 3,
          fps,
          config: { damping: 200 },
        });

        const angle = (i / 12) * Math.PI * 2;
        const baseRadius = 180;
        const radiusVar = Math.sin(frame / 15 + i) * 25;
        const radius = interpolate(
          particleEntrance,
          [0, 1],
          [50, baseRadius + radiusVar],
          { extrapolateRight: 'clamp' }
        );

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const particleOpacity = interpolate(
          particleEntrance,
          [0, 0.5, 1],
          [0, 0.6, 0.3],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: `hsl(${colorShift + i * 15}, 80%, 65%)`,
              transform: `translate(${x}px, ${y}px)`,
              opacity: particleOpacity,
              boxShadow: `0 0 6px 2px hsl(${colorShift + i * 15}, 80%, 65%, 0.4)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
