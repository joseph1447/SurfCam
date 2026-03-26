import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SurfCam Live Stream - Embed Widget",
  description: "Santa Teresa Live Surf Cam 24/7 - Embeddable Widget",
  robots: "noindex, nofollow",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { overflow: hidden; background: #0f0f23; }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
