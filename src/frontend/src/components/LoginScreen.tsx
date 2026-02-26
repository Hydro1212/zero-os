import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  onLogin: () => void;
  isLoggingIn: boolean;
  isInitializing: boolean;
}

// Boot lines that stream in during the pre-login sequence
const BOOT_LINES = [
  "ZERO OS v1.0.0",
  "Initializing kernel modules...",
  "Loading neon subsystem... OK",
  "Mounting virtual filesystem... OK",
  "Starting ICP bridge... OK",
  "Authenticating identity layer...",
];

export function LoginScreen({ onLogin, isLoggingIn, isInitializing }: Props) {
  // Phase: "booting" → "login"
  const [phase, setPhase] = useState<"booting" | "login">("booting");
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Boot sequence: reveal lines one by one, then transition to login
  useEffect(() => {
    let line = 0;
    const reveal = () => {
      line++;
      setVisibleLines(line);
      if (line < BOOT_LINES.length) {
        setTimeout(reveal, 90);
      } else {
        // After last line, wait then switch to login
        setTimeout(() => setPhase("login"), 520);
      }
    };
    const timer = setTimeout(reveal, 200);
    return () => clearTimeout(timer);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const iv = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(iv);
  }, []);

  // Neon grid canvas on login screen
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

    function draw() {
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

      // Vertical convergence lines
      for (let i = -cols; i <= cols; i++) {
        const worldX = i * gridSpacing;
        const nearX = w / 2 + (worldX / fov) * h;
        const nearY = h;
        const farX = w / 2 + (worldX / (fov * 3)) * 40;
        const farY = horizon;
        const alpha = Math.max(0, 1 - Math.abs(i) / cols);

        const grad = ctx.createLinearGradient(farX, farY, nearX, nearY);
        grad.addColorStop(0, `rgba(0,245,255,0)`);
        grad.addColorStop(0.5, `rgba(0,245,255,${alpha * 0.25})`);
        grad.addColorStop(1, `rgba(0,245,255,${alpha * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(farX, farY);
        ctx.lineTo(nearX, nearY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Horizontal scroll rows
      for (let j = 0; j <= rows; j++) {
        const depth = j / rows;
        const scrolledDepth = (depth + (offset / gridSpacing) / rows) % 1;
        if (scrolledDepth <= 0) continue;

        const y = horizon + (h - horizon) * scrolledDepth;
        const width = w * scrolledDepth * 1.5;
        const x1 = w / 2 - width / 2;
        const x2 = w / 2 + width / 2;
        const a = scrolledDepth * 0.4;

        const grad = ctx.createLinearGradient(x1, y, x2, y);
        grad.addColorStop(0, `rgba(0,245,255,0)`);
        grad.addColorStop(0.2, `rgba(0,245,255,${a})`);
        grad.addColorStop(0.5, `rgba(0,245,255,${a * 1.3})`);
        grad.addColorStop(0.8, `rgba(0,245,255,${a})`);
        grad.addColorStop(1, `rgba(0,245,255,0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Horizon glow
      const hGrad = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 30);
      hGrad.addColorStop(0, "rgba(0,245,255,0)");
      hGrad.addColorStop(0.5, "rgba(0,245,255,0.08)");
      hGrad.addColorStop(1, "rgba(0,245,255,0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, horizon - 30, w, 60);

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "#050510" }}
    >
      {/* Neon grid canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* ── Boot Phase ── */}
      {phase === "booting" && (
        <div
          className="relative z-10 font-share-tech"
          style={{
            padding: "32px 40px",
            minWidth: "480px",
            maxWidth: "600px",
          }}
        >
          {/* OS name header */}
          <div
            className="animate-boot-text font-orbitron mb-6"
            style={{
              fontSize: "22px",
              letterSpacing: "0.3em",
              color: "#00f5ff",
              textShadow: "0 0 16px rgba(0,245,255,0.7)",
            }}
          >
            ZERO OS
          </div>

          {/* Boot lines */}
          <div className="space-y-1">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div
                key={line}
                className="animate-boot-line flex items-center gap-3"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                }}
              >
                <span style={{ color: "rgba(0,245,255,0.35)" }}>[</span>
                <span style={{ color: "#00ff88", minWidth: "40px" }}>
                  {i < visibleLines - 1 ? "OK" : "..."}
                </span>
                <span style={{ color: "rgba(220,240,255,0.7)" }}>{line}</span>
              </div>
            ))}
            {/* Blinking cursor */}
            {visibleLines > 0 && visibleLines < BOOT_LINES.length + 1 && (
              <div
                className="inline-block"
                style={{
                  width: "8px",
                  height: "14px",
                  background: "#00f5ff",
                  opacity: cursorVisible ? 0.9 : 0,
                  marginLeft: "4px",
                  marginTop: "4px",
                  boxShadow: "0 0 6px rgba(0,245,255,0.8)",
                  transition: "opacity 0.05s",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Login Phase ── */}
      {phase === "login" && (
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            padding: "48px 56px",
            background: "rgba(6, 6, 22, 0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,245,255,0.2)",
            borderRadius: "20px",
            boxShadow: "0 0 60px rgba(0,245,255,0.08), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,245,255,0.1)",
            minWidth: "340px",
          }}
        >
          {/* Logo mark — fades + scales in */}
          <div
            className="mb-6 flex items-center justify-center rounded-2xl animate-logo-in animate-logo-glow"
            style={{
              width: "72px",
              height: "72px",
              background: "rgba(0,245,255,0.06)",
              border: "1px solid rgba(0,245,255,0.25)",
              fontSize: "32px",
            }}
          >
            ⬡
          </div>

          {/* Title — fades + scales */}
          <h1
            className="font-orbitron animate-logo-in"
            style={{
              fontSize: "28px",
              letterSpacing: "0.25em",
              color: "#00f5ff",
              textShadow: "0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.3)",
              fontWeight: 700,
              marginBottom: "6px",
              animationDuration: "0.8s",
            }}
          >
            ZERO OS
          </h1>

          {/* Subtitle — slides up with delay */}
          <p
            className="font-share-tech animate-subtitle-in"
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              color: "rgba(0,245,255,0.4)",
              marginBottom: "32px",
              textTransform: "uppercase",
            }}
          >
            Futuristic Web Desktop
          </p>

          {/* Decorative separator */}
          <div
            className="animate-subtitle-in"
            style={{
              width: "100%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)",
              marginBottom: "32px",
            }}
          />

          {/* Button / loading — fades in last */}
          <div className="animate-btn-in w-full">
            {isInitializing ? (
              <div className="flex items-center justify-center gap-2" style={{ color: "rgba(0,245,255,0.5)" }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="font-share-tech" style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                  INITIALIZING...
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="relative overflow-hidden rounded-xl transition-all duration-200 font-orbitron w-full"
                style={{
                  padding: "13px 40px",
                  background: isLoggingIn ? "rgba(0,245,255,0.05)" : "rgba(0,245,255,0.08)",
                  border: "1px solid rgba(0,245,255,0.4)",
                  color: "#00f5ff",
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  boxShadow: isLoggingIn ? "none" : "0 0 20px rgba(0,245,255,0.15), inset 0 1px 0 rgba(0,245,255,0.1)",
                  cursor: isLoggingIn ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (isLoggingIn) return;
                  const el = e.currentTarget;
                  el.style.background = "rgba(0,245,255,0.15)";
                  el.style.boxShadow = "0 0 30px rgba(0,245,255,0.35), 0 0 60px rgba(0,245,255,0.15)";
                  el.style.borderColor = "rgba(0,245,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (isLoggingIn) return;
                  const el = e.currentTarget;
                  el.style.background = "rgba(0,245,255,0.08)";
                  el.style.boxShadow = "0 0 20px rgba(0,245,255,0.15), inset 0 1px 0 rgba(0,245,255,0.1)";
                  el.style.borderColor = "rgba(0,245,255,0.4)";
                }}
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    AUTHENTICATING...
                  </span>
                ) : (
                  "LOGIN WITH INTERNET IDENTITY"
                )}
              </button>
            )}
          </div>

          {/* Bottom info */}
          <p
            className="font-share-tech mt-5 animate-btn-in"
            style={{ fontSize: "10px", color: "rgba(0,245,255,0.2)", letterSpacing: "0.08em" }}
          >
            Powered by Internet Computer Protocol
          </p>
        </div>
      )}

      {/* Floating hexagonal decorations */}
      {[
        { id: "hex1", top: "15%", left: "10%", size: 40, opacity: 0.08, delay: "0s" },
        { id: "hex2", top: "70%", left: "8%",  size: 24, opacity: 0.06, delay: "1s" },
        { id: "hex3", top: "20%", right: "12%", size: 56, opacity: 0.06, delay: "0.5s" },
        { id: "hex4", top: "75%", right: "10%", size: 32, opacity: 0.08, delay: "1.5s" },
      ].map((d) => (
        <div
          key={d.id}
          className="absolute font-orbitron pointer-events-none"
          style={{
            top: d.top,
            left: "left" in d ? d.left : undefined,
            right: "right" in d ? d.right : undefined,
            fontSize: `${d.size}px`,
            color: "#00f5ff",
            opacity: d.opacity,
            animation: `neon-pulse 3s ease-in-out ${d.delay} infinite`,
          }}
        >
          ⬡
        </div>
      ))}
    </div>
  );
}
