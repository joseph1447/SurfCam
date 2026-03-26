"use client";

import { useEffect, useState } from "react";

export default function EmbedStreamPage() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channelId] = useState(
    process.env.NEXT_PUBLIC_YT_CHANNEL_ID || "UCa4397KS7YBwp7pkA8B5J6g"
  );

  useEffect(() => {
    // Verify the parent domain is allowed
    const parentOrigin = document.referrer
      ? new URL(document.referrer).origin
      : null;

    // If loaded directly (no referrer), check if it's development
    if (!parentOrigin) {
      const isDev =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isDev) {
        setAllowed(true);
        fetchVideoId();
        return;
      }
      setAllowed(false);
      setError("Este widget solo puede ser usado desde un sitio autorizado.");
      return;
    }

    // Verify domain against our API
    fetch(`/api/embed/verify?origin=${encodeURIComponent(parentOrigin)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.allowed) {
          setAllowed(true);
          fetchVideoId();
        } else {
          setAllowed(false);
          setError("Este dominio no está autorizado para mostrar el stream.");
        }
      })
      .catch(() => {
        setAllowed(false);
        setError("Error al verificar autorización.");
      });
  }, []);

  const fetchVideoId = async () => {
    try {
      const res = await fetch("/api/youtube-live");
      const data = await res.json();
      if (data.videoId) {
        setVideoId(data.videoId);
      } else {
        // Fallback to site config
        const configRes = await fetch("/api/site-config?key=youtube_video_id");
        const configData = await configRes.json();
        setVideoId(configData.value || null);
      }
    } catch {
      setVideoId(null);
    }
  };

  // Loading state
  if (allowed === null) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Not allowed
  if (!allowed) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p style={styles.errorTitle}>Acceso no autorizado</p>
          <p style={styles.errorText}>{error}</p>
          <a
            href="https://www.wedoitwithai.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Visitar WeDoItWithAI.com
          </a>
        </div>
      </div>
    );
  }

  // Build YouTube embed URL
  const getEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "1",
      rel: "0",
      playsinline: "1",
      modestbranding: "1",
    });

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&${params.toString()}`;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div style={styles.container}>
      {!videoId && !channelId ? (
        <div style={styles.errorBox}>
          <p style={styles.errorTitle}>Stream no disponible</p>
          <p style={styles.errorText}>
            La transmisión en vivo no está disponible en este momento.
          </p>
        </div>
      ) : (
        <>
          <iframe
            src={embedUrl}
            title="Santa Teresa Live Surf Cam"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={styles.iframe}
          />
          <div style={styles.bottomBar}>
            <a
              href="https://santateresasurfcam.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.visitLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Visitar Santa Teresa Surf Cam
            </a>
            <span style={styles.separator}>|</span>
            <a
              href="https://www.wedoitwithai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.poweredLink}
            >
              Powered by <span style={styles.poweredBrand}>WeDoItWithAI.com</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#0f0f23",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  loader: {
    textAlign: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(255,255,255,0.2)",
    borderTop: "3px solid #06B6D4",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  errorBox: {
    textAlign: "center",
    padding: 32,
    maxWidth: 400,
  },
  errorTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  link: {
    color: "#06B6D4",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "calc(100% - 32px)",
    border: "none",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #0a1628 0%, #0f2a3d 100%)",
    borderTop: "1px solid rgba(6, 182, 212, 0.2)",
    zIndex: 10,
  },
  visitLink: {
    color: "#06B6D4",
    fontSize: 12,
    textDecoration: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
    letterSpacing: 0.3,
    transition: "color 0.2s",
  },
  separator: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 12,
    userSelect: "none" as const,
  },
  poweredLink: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    textDecoration: "none",
    fontWeight: 400,
    letterSpacing: 0.2,
  },
  poweredBrand: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: 600,
  },
};
