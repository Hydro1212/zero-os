import { useEffect, useRef } from "react";
import type { Settings } from "../backend.d";

interface Props {
  settings: Settings;
}

export function DesktopBackground({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Grid animation ────────────────────────────────────────────────────────
    function drawGrid() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const horizon = h * 0.45;
      const fov = 300;
      const gridSpacing = 60;
      const cols = 30;
      const rows = 20;

      offset = (offset + 0.4) % gridSpacing;

      ctx.save();

      // Vertical lines (converge to center horizon)
      for (let i = -cols; i <= cols; i++) {
        const worldX = i * gridSpacing;
        // Near screen bottom
        const nearX = w / 2 + (worldX / fov) * h;
        const nearY = h;
        // At horizon
        const farX = w / 2 + (worldX / (fov * 3)) * 40;
        const farY = horizon;

        const alpha = Math.max(0, 1 - Math.abs(i) / cols);
        const gradient = ctx.createLinearGradient(farX, farY, nearX, nearY);
        gradient.addColorStop(0, `rgba(0, 245, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(0, 245, 255, ${alpha * 0.35})`);
        gradient.addColorStop(1, `rgba(0, 245, 255, ${alpha * 0.7})`);

        ctx.beginPath();
        ctx.moveTo(farX, farY);
        ctx.lineTo(nearX, nearY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Horizontal lines (perspective rows)
      for (let j = 0; j <= rows; j++) {
        const depth = j / rows;
        const scrolledDepth = (depth + (offset / gridSpacing) / rows) % 1;
        const perspective = 1 - scrolledDepth;
        if (perspective <= 0) continue;

        const y = horizon + (h - horizon) * scrolledDepth;
        const width = (w * scrolledDepth * 1.5);
        const x1 = w / 2 - width / 2;
        const x2 = w / 2 + width / 2;

        const alpha = scrolledDepth * 0.55;
        const gradient = ctx.createLinearGradient(x1, y, x2, y);
        gradient.addColorStop(0, `rgba(0, 245, 255, 0)`);
        gradient.addColorStop(0.2, `rgba(0, 245, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(0, 245, 255, ${alpha * 1.3})`);
        gradient.addColorStop(0.8, `rgba(0, 245, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 245, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Horizon glow
      const horizonGrad = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 30);
      horizonGrad.addColorStop(0, "rgba(0,245,255,0)");
      horizonGrad.addColorStop(0.5, "rgba(0,245,255,0.12)");
      horizonGrad.addColorStop(1, "rgba(0,245,255,0)");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizon - 30, w, 60);

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(drawGrid);
    }

    // ── Particles animation ────────────────────────────────────────────────────
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const neonColors = ["#00f5ff", "#bf00ff", "#ff00a0", "#00ff88"];

    function spawnParticle(): Particle {
      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      return {
        x: Math.random() * (canvas?.width ?? 800),
        y: Math.random() * (canvas?.height ?? 600),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.2,
        size: Math.random() * 2.5 + 0.5,
        opacity: 0,
        color,
        life: 0,
        maxLife: Math.random() * 300 + 150,
      };
    }

    function drawParticles() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles
      while (particles.length < 120) {
        particles.push(spawnParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.opacity = lifeRatio / 0.1;
        } else if (lifeRatio > 0.8) {
          p.opacity = (1 - lifeRatio) / 0.2;
        } else {
          p.opacity = 1;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity * 0.85;

        // Glow
        ctx.shadowBlur = p.size * 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(drawParticles);
    }

    if (settings.backgroundEffect === "grid") {
      drawGrid();
    } else if (settings.backgroundEffect === "particles") {
      drawParticles();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [settings.backgroundEffect]);

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ background: settings.wallpaper || "#050510" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: settings.backgroundEffect === "none" ? 0 : 1 }}
      />
      {/* Scanline overlay for cyberpunk effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
