"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Share2,
  Link2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ShortVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Hace minutos";
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-CR", { month: "short", day: "numeric" });
}

function ShareMenu({
  video,
  onClose,
}: {
  video: ShortVideo;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const shareText = `🌊 Mira las olas en Santa Teresa, Costa Rica! ${video.url}`;
  const encodedUrl = encodeURIComponent(video.url);
  const encodedText = encodeURIComponent(shareText);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(video.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = video.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: "Mira las olas en Santa Teresa, Costa Rica!",
          url: video.url,
        });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  const channels = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: "bg-[#25D366] hover:bg-[#20BD5A]",
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      name: "Messenger",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.26 5.886-3.26-6.558 6.763z" />
        </svg>
      ),
      color: "bg-[#0084FF] hover:bg-[#006FDB]",
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-[#000] hover:bg-[#333]",
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full right-0 mb-2 z-50 bg-[#1a1f2e]/95 backdrop-blur-xl border border-white/15 rounded-xl p-3 shadow-2xl shadow-black/60 min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          Compartir
        </span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {channels.map((ch) => (
          <a
            key={ch.name}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ch.color} text-white rounded-lg p-2.5 flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95`}
            title={ch.name}
          >
            {ch.icon}
            <span className="text-[9px] font-medium leading-none">
              {ch.name}
            </span>
          </a>
        ))}
      </div>

      {/* Native share (mobile) */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={shareNative}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white text-sm mb-1"
        >
          <Share2 className="w-4 h-4" />
          <span>Más opciones...</span>
        </button>
      )}

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white text-sm"
      >
        <Link2 className="w-4 h-4" />
        <span>{copied ? "¡Copiado!" : "Copiar enlace"}</span>
      </button>
    </div>
  );
}

function ShortCard({ video }: { video: ShortVideo }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="group relative flex-shrink-0 w-[160px] sm:w-[180px]">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-[9/16] rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10"
      >
        {/* Thumbnail */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Shorts badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
            <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z" />
          </svg>
          Short
        </div>

        {/* Time badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
          {formatRelativeDate(video.publishedAt)}
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-xs text-white font-medium leading-tight line-clamp-2 drop-shadow-lg">
            {video.title}
          </p>
        </div>
      </a>

      {/* Share button - outside the link */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShareOpen(!shareOpen);
          }}
          className="absolute -top-8 right-2 z-10 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
          title="Compartir"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        {shareOpen && (
          <ShareMenu video={video} onClose={() => setShareOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default function RecentSurfReports() {
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch("/api/recent-shorts")
      .then((r) => r.json())
      .then((data) => {
        setShorts(data.shorts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        ro.disconnect();
      };
    }
  }, [shorts]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "left" ? -300 : 300;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="w-full backdrop-blur-md bg-[#121419]/80 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 bg-red-500/30 rounded animate-pulse" />
          <div className="h-5 bg-white/10 rounded w-48 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] sm:w-[180px] aspect-[9/16] bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (shorts.length === 0) return null;

  return (
    <div className="w-full backdrop-blur-md bg-[#121419]/80 border border-white/10 rounded-2xl p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-red-400"
              fill="currentColor"
            >
              <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90">
              Reportes Recientes
            </h3>
            <p className="text-[11px] text-white/40">
              Condiciones de olas capturadas automáticamente
            </p>
          </div>
        </div>

        <a
          href={`https://www.youtube.com/@QuesadaJoseph/videos`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-cyan-400/80 hover:text-cyan-400 transition-colors"
        >
          Ver todos
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Scrollable shorts row */}
      <div className="relative group/scroll">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-black/60 backdrop-blur-sm rounded-r-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-black/60 backdrop-blur-sm rounded-l-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {shorts.map((video) => (
            <ShortCard key={video.videoId} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
