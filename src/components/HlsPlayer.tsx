"use client";

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Extender window para incluir la instancia de HLS
declare global {
    interface Window {
        hlsInstance: Hls | null;
    }
}

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
            
            // Guardar la instancia en window para poder destruirla desde otros efectos
            window.hlsInstance = hls;
            
            hls.loadSource(src);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Intentar reproducir automáticamente cuando el manifiesto esté listo
                if (!isPaused) {
                    // Intentar reproducir inmediatamente
                    video.play().catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Error trying to play video:", error);
                        }
                    });
                    
                    // Si falla, intentar de nuevo cuando el video esté más listo
                    if (video.readyState < 2) {
                        const playWhenReady = () => {
                            if (video.readyState >= 2 && !isPaused) {
                                video.play().catch(error => {
                                    if (error.name !== 'AbortError') {
                                        console.error("Error trying to play video:", error);
                                    }
                                });
                                video.removeEventListener('canplay', playWhenReady);
                            }
                        };
                        video.addEventListener('canplay', playWhenReady);
                    }
                }
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
                // Intentar reproducir automáticamente cuando los metadatos estén cargados
                if (!isPaused) {
                    video.play().catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Error trying to play video:", error);
                        }
                    });
                    
                    // Si falla, intentar de nuevo cuando el video esté más listo
                    if (video.readyState < 2) {
                        const playWhenReady = () => {
                            if (video.readyState >= 2 && !isPaused) {
                                video.play().catch(error => {
                                    if (error.name !== 'AbortError') {
                                        console.error("Error trying to play video:", error);
                                    }
                                });
                                video.removeEventListener('canplay', playWhenReady);
                            }
                        };
                        video.addEventListener('canplay', playWhenReady);
                    }
                }
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
                window.hlsInstance = null;
            }
        };
    }, [src, isPaused]);

    // Efecto adicional para asegurar autoplay inicial
    useEffect(() => {
        const video = videoRef.current;
        if (!video || isPaused) return;

        // Intentar reproducir después de un breve delay para asegurar que todo esté listo
        const initialPlayAttempt = setTimeout(() => {
            if (!isPaused && video.readyState >= 1) { // HAVE_METADATA
                video.play().catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error("Error in initial play attempt:", error);
                    }
                });
            }
        }, 500);

        return () => clearTimeout(initialPlayAttempt);
    }, [src, isPaused]);

    // Efecto para pausar/reanudar el video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPaused) {
            // Pausar el video
            video.pause();
            
            // Forzar salida de pantalla completa si está activa
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {
                    // Si falla exitFullscreen, intentar con webkit
                    if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                });
            }
            
            // Detener la carga del video para asegurar que no siga reproduciéndose
            video.src = '';
            video.load();
            
            // Si hay una instancia de HLS, destruirla
            if (window.hlsInstance) {
                window.hlsInstance.destroy();
                window.hlsInstance = null;
            }
        } else {
            // Solo intentar reproducir si no está pausado
            const attemptPlay = () => {
                if (video.readyState >= 2 && !isPaused) {
                    video.play().catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Error trying to play video:", error);
                        }
                    });
                } else if (!isPaused) {
                    // Si no está listo, esperar y intentar de nuevo
                    setTimeout(attemptPlay, 100);
                }
            };
            attemptPlay();
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
            controls={!isPaused}
            autoPlay 
            muted 
            playsInline
            preload="auto"
            className="w-full h-full"
            style={{ pointerEvents: isPaused ? 'none' : 'auto' }}
        />
    );
}
