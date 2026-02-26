import React, { useEffect, useRef } from 'react';
import { ParticleIntensity } from '../backend';
import type { Settings } from '../backend';

type ParticleIntensityValue = Settings['particleIntensity'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'dot' | 'orb' | 'streak';
  life: number;
  maxLife: number;
  length?: number;
  angle?: number;
}

interface ParticleEffectProps {
  intensity?: ParticleIntensityValue;
}

function getParticleCount(intensity: ParticleIntensityValue | undefined): number {
  switch (intensity) {
    case ParticleIntensity.off: return 0;
    case ParticleIntensity.low: return 80;
    case ParticleIntensity.high: return 400;
    default: return 200;
  }
}

export default function ParticleEffect({ intensity = ParticleIntensity.medium }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#00e5ff', '#e040fb', '#ffffff', '#00ff9f'];

    function createParticle(type: Particle['type']): Particle {
      const w = canvas!.width;
      const h = canvas!.height;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = 200 + Math.random() * 300;
      if (type === 'dot') {
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          size: 1 + Math.random() * 2, opacity: 0.3 + Math.random() * 0.5,
          color, type, life: Math.random() * maxLife, maxLife,
        };
      } else if (type === 'orb') {
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2, vy: -0.1 - Math.random() * 0.3,
          size: 3 + Math.random() * 5, opacity: 0.15 + Math.random() * 0.3,
          color, type, life: Math.random() * maxLife, maxLife,
        };
      } else {
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.6, vy: -0.2 - Math.random() * 0.5,
          size: 1, opacity: 0.2 + Math.random() * 0.4,
          color, type, life: Math.random() * maxLife, maxLife,
          length: 10 + Math.random() * 30,
          angle: Math.random() * Math.PI * 2,
        };
      }
    }

    function initParticles() {
      const count = getParticleCount(intensityRef.current);
      particlesRef.current = [];
      const dotCount = Math.floor(count * 0.6);
      const orbCount = Math.floor(count * 0.25);
      const streakCount = count - dotCount - orbCount;
      for (let i = 0; i < dotCount; i++) particlesRef.current.push(createParticle('dot'));
      for (let i = 0; i < orbCount; i++) particlesRef.current.push(createParticle('orb'));
      for (let i = 0; i < streakCount; i++) particlesRef.current.push(createParticle('streak'));
    }

    initParticles();

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentCount = getParticleCount(intensityRef.current);
      if (currentCount === 0) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      while (particlesRef.current.length < currentCount) {
        const types: Particle['type'][] = ['dot', 'dot', 'dot', 'orb', 'orb', 'streak'];
        particlesRef.current.push(createParticle(types[Math.floor(Math.random() * types.length)]));
      }
      if (particlesRef.current.length > currentCount) {
        particlesRef.current = particlesRef.current.slice(0, currentCount);
      }

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        if (p.life > p.maxLife || p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
          const types: Particle['type'][] = ['dot', 'dot', 'dot', 'orb', 'orb', 'streak'];
          particlesRef.current[i] = createParticle(types[Math.floor(Math.random() * types.length)]);
          return;
        }

        const lifeFraction = p.life / p.maxLife;
        const fadeOpacity = lifeFraction < 0.1 ? lifeFraction * 10 : lifeFraction > 0.8 ? (1 - lifeFraction) * 5 : 1;
        const alpha = p.opacity * fadeOpacity;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        if (p.type === 'dot') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 4;
          ctx.fill();
        } else if (p.type === 'orb') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 6;
          ctx.fill();
        } else if (p.type === 'streak' && p.length !== undefined && p.angle !== undefined) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(p.angle) * p.length, p.y + Math.sin(p.angle) * p.length);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.stroke();
        }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (intensity === ParticleIntensity.off) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
