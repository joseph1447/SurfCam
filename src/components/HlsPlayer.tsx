"use client";

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
    src: string;
}

export default function HlsPlayer({ src }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                debug: true,
                enableWorker: true,
                lowLatencyMode: true,
            });
            
            console.log('Loading HLS source:', src);
            hls.loadSource(src);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_LOADING, () => {
                console.log('HLS: Manifest loading...');
            });
            
            hls.on(Hls.Events.MANIFEST_LOADED, () => {
                console.log('HLS: Manifest loaded successfully');
            });
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS: Manifest parsed, attempting to play');
                video.play().catch(error => {
                    console.error("Error trying to play video:", error);
                });
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error, trying to recover...');
                            hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error, trying to recover...');
                            hls?.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, destroying HLS instance');
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
