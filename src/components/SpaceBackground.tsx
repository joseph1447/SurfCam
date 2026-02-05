"use client";

import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  size: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  opacity: number;
}

interface LightRay {
  x: number;
  width: number;
  opacity: number;
  speed: number;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const bubblesRef = useRef<Bubble[]>([]);
  const lightRaysRef = useRef<LightRay[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize bubbles
    const initBubbles = () => {
      const bubbles: Bubble[] = [];
      const numBubbles = 60;

      for (let i = 0; i < numBubbles; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 15 + 5,
          speedY: Math.random() * 1.5 + 0.5,
          wobbleSpeed: Math.random() * 0.03 + 0.01,
          wobbleOffset: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
      bubblesRef.current = bubbles;
    };

    // Initialize light rays
    const initLightRays = () => {
      const rays: LightRay[] = [];
      const numRays = 8;

      for (let i = 0; i < numRays; i++) {
        rays.push({
          x: (canvas.width / numRays) * i + Math.random() * 100,
          width: Math.random() * 100 + 50,
          opacity: Math.random() * 0.08 + 0.02,
          speed: Math.random() * 0.5 + 0.2,
        });
      }
      lightRaysRef.current = rays;
    };

    initBubbles();
    initLightRays();

    // Animation loop
    const animate = () => {
      // Create ocean gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#001a2e"); // Deep ocean top
      gradient.addColorStop(0.3, "#002844"); // Mid ocean
      gradient.addColorStop(0.6, "#003355"); // Lighter mid
      gradient.addColorStop(1, "#004466"); // Ocean floor area

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      // Draw light rays from surface
      const rays = lightRaysRef.current;
      rays.forEach((ray) => {
        const rayGradient = ctx.createLinearGradient(ray.x, 0, ray.x, canvas.height * 0.7);
        const pulsingOpacity = ray.opacity * (0.7 + Math.sin(time * ray.speed) * 0.3);
        rayGradient.addColorStop(0, `rgba(100, 200, 255, ${pulsingOpacity})`);
        rayGradient.addColorStop(0.5, `rgba(50, 150, 200, ${pulsingOpacity * 0.5})`);
        rayGradient.addColorStop(1, "rgba(0, 100, 150, 0)");

        ctx.beginPath();
        ctx.moveTo(ray.x - ray.width / 2, 0);
        ctx.lineTo(ray.x + ray.width / 2, 0);
        ctx.lineTo(ray.x + ray.width * 1.5, canvas.height * 0.7);
        ctx.lineTo(ray.x - ray.width, canvas.height * 0.7);
        ctx.closePath();
        ctx.fillStyle = rayGradient;
        ctx.fill();
      });

      // Draw bubbles
      const bubbles = bubblesRef.current;
      bubbles.forEach((bubble) => {
        // Update position - bubbles rise
        bubble.y -= bubble.speedY;

        // Wobble side to side
        const wobble = Math.sin(time * bubble.wobbleSpeed * 10 + bubble.wobbleOffset) * 20;
        const currentX = bubble.x + wobble;

        // Reset bubble when it goes off top
        if (bubble.y < -bubble.size * 2) {
          bubble.y = canvas.height + bubble.size;
          bubble.x = Math.random() * canvas.width;
        }

        // Draw bubble with gradient for 3D effect
        const bubbleGradient = ctx.createRadialGradient(
          currentX - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          0,
          currentX,
          bubble.y,
          bubble.size
        );

        bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.9})`);
        bubbleGradient.addColorStop(0.3, `rgba(150, 220, 255, ${bubble.opacity * 0.6})`);
        bubbleGradient.addColorStop(0.7, `rgba(100, 180, 230, ${bubble.opacity * 0.3})`);
        bubbleGradient.addColorStop(1, `rgba(50, 150, 200, ${bubble.opacity * 0.1})`);

        ctx.beginPath();
        ctx.arc(currentX, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGradient;
        ctx.fill();

        // Bubble highlight
        ctx.beginPath();
        ctx.arc(
          currentX - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          bubble.size * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.8})`;
        ctx.fill();

        // Bubble border
        ctx.beginPath();
        ctx.arc(currentX, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150, 220, 255, ${bubble.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Add subtle caustic effect at bottom
      const causticGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height,
        0,
        canvas.width / 2,
        canvas.height,
        canvas.width * 0.8
      );
      const causticPulse = 0.05 + Math.sin(time * 0.5) * 0.02;
      causticGradient.addColorStop(0, `rgba(100, 200, 255, ${causticPulse})`);
      causticGradient.addColorStop(0.5, `rgba(50, 150, 200, ${causticPulse * 0.5})`);
      causticGradient.addColorStop(1, "rgba(0, 100, 150, 0)");
      ctx.fillStyle = causticGradient;
      ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
