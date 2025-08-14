"use client";

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
    src: string;
    isPaused?: boolean;
}

export default function HlsPlayer({ src, isPaused = false }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            
            hls.loadSource(src);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(error => {
                    console.error("Error trying to play video:", error);
                });
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls?.recoverMediaError();
                            break;
                        default:
                            hls?.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari, which has native HLS support
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(error => {
                    console.error("Error trying to play video:", error);
                });
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    // Efecto para pausar/reanudar el video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPaused) {
            video.pause();
        } else {
            video.play().catch(error => {
                console.error("Error trying to play video:", error);
            });
        }
    }, [isPaused]);

    if (!src) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center text-white">
                <p>URL del stream no configurada.</p>
            </div>
        );
    }

    return (
        <video 
            ref={videoRef} 
            controls 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full"
        />
    );
}
