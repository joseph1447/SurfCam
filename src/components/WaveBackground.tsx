// Night nautical chart: depth-lit water, bathymetric contours around the reef, a touch of
// grain. Fully static (no animation loop), rendered once on the server.

// Irregular closed rings around a point, like depth contours on a chart.
function contours(cx: number, cy: number, rings: number, step: number, seed: number) {
  return Array.from({ length: rings }, (_, k) => {
    const r0 = 90 + k * step;
    const pts = Array.from({ length: 97 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2;
      const r =
        r0 *
        (1 +
          0.07 * Math.sin(3 * a + k * 0.55 + seed) +
          0.04 * Math.sin(5 * a - k * 0.9 + seed * 2) +
          0.025 * Math.sin(9 * a + k * 1.7));
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a) * 0.62).toFixed(1)}`;
    });
    return `M${pts.join("L")}Z`;
  });
}

const REEF = contours(1560, 40, 16, 64, 0.4);
const POINT = contours(180, 1120, 9, 70, 2.1);

export default function WaveBackground() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 88% -8%, rgba(0,170,255,0.17), transparent 62%)," +
            "radial-gradient(900px 520px at -8% 108%, rgba(255,106,0,0.07), transparent 60%)," +
            "linear-gradient(180deg, #0a1a28 0%, #07121d 42%, #050c14 100%)",
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#9fd4f0" strokeWidth={1}>
          {REEF.map((d, i) => (
            <path key={`r${i}`} d={d} strokeOpacity={i % 4 === 0 ? 0.11 : 0.055} />
          ))}
          {POINT.map((d, i) => (
            <path key={`p${i}`} d={d} strokeOpacity={i % 3 === 0 ? 0.08 : 0.04} />
          ))}
        </g>
      </svg>

      <svg className="absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay">
        <filter id="bg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-grain)" />
      </svg>

      {/* Vignette keeps the edges deep so panels float */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(2,6,11,0.55) 100%)" }} />
    </div>
  );
}
