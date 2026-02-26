import { useState, useRef, useCallback, useEffect } from "react";
import { Minus, X, ExternalLink } from "lucide-react";
import type { App } from "../backend.d";

type WindowPhase = "open" | "minimizing" | "minimized" | "restoring";

interface Props {
  app: App;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
  initialPosition?: { x: number; y: number };
  taskbarPosition?: string;
}

export function AppWindow({
  app,
  onClose,
  zIndex,
  onFocus,
  initialPosition,
  taskbarPosition = "bottom",
}: Props) {
  const [pos, setPos] = useState(
    initialPosition ?? { x: 80 + Math.random() * 200, y: 60 + Math.random() * 100 }
  );
  const [size] = useState({ w: 900, h: 580 });
  const [phase, setPhase] = useState<WindowPhase>("open");

  const isDragging  = useRef(false);
  const dragOffset  = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      onFocus();
      e.preventDefault();
    },
    [pos, onFocus]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth  - size.w));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - size.h));
      setPos({ x: newX, y: newY });
    };
    const handleMouseUp = () => { isDragging.current = false; };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, [size.w, size.h]);

  const handleMinimize = useCallback(() => {
    setPhase("minimizing");
    // After animation completes, fully hide
    setTimeout(() => setPhase("minimized"), 260);
  }, []);

  const handleRestore = useCallback(() => {
    setPhase("restoring");
    setTimeout(() => setPhase("open"), 320);
  }, []);

  // Determine animation class based on phase
  const getAnimClass = () => {
    switch (phase) {
      case "open":       return "animate-window-open";
      case "minimizing": return taskbarPosition === "bottom"
        ? "animate-window-minimize-bottom"
        : "animate-window-minimize-top";
      case "restoring":  return "animate-window-restore";
      default:           return "";
    }
  };

  if (phase === "minimized") {
    // Show a small restore indicator on the taskbar edge
    return (
      <button
        type="button"
        onClick={handleRestore}
        className="fixed z-40 flex items-center gap-1.5 rounded-t-lg px-3 transition-all duration-150 font-orbitron"
        style={{
          [taskbarPosition === "bottom" ? "bottom" : "top"]: "52px",
          left: `${pos.x + 20}px`,
          height: "28px",
          background: `${app.color}18`,
          border: `1px solid ${app.color}44`,
          borderBottom: taskbarPosition === "bottom" ? "none" : undefined,
          borderTop:    taskbarPosition === "top"    ? "none" : undefined,
          color:        app.color,
          fontSize:     "10px",
          letterSpacing:"0.1em",
          textTransform:"uppercase",
          boxShadow:    `0 0 12px ${app.color}33`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${app.color}30`;
          e.currentTarget.style.boxShadow  = `0 0 20px ${app.color}66`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${app.color}18`;
          e.currentTarget.style.boxShadow  = `0 0 12px ${app.color}33`;
        }}
      >
        <span style={{ fontSize: "13px" }}>{app.emoji}</span>
        {app.name}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={app.name}
      className={`fixed rounded-xl overflow-hidden ${getAnimClass()}`}
      style={{
        left:      pos.x,
        top:       pos.y,
        width:     size.w,
        height:    size.h,
        zIndex,
        background:     "rgba(3, 3, 15, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:     `1px solid ${app.color}44`,
        boxShadow:  `0 0 40px ${app.color}22, 0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
        maxWidth:  "calc(100vw - 20px)",
        maxHeight: "calc(100vh - 60px)",
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        role="toolbar"
        aria-label={`${app.name} window controls`}
        className="window-titlebar flex items-center justify-between px-4"
        style={{
          height:      "40px",
          background:  `linear-gradient(90deg, rgba(3,3,15,0.9) 0%, ${app.color}11 100%)`,
          borderBottom:`1px solid ${app.color}33`,
          cursor:      "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* App info */}
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{app.emoji}</span>
          <span
            className="font-orbitron"
            style={{
              fontSize:      "11px",
              letterSpacing: "0.1em",
              color:         app.color,
              textShadow:    `0 0 8px ${app.color}88`,
              textTransform: "uppercase",
            }}
          >
            {app.name}
          </span>
          <span
            className="font-share-tech"
            style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}
          >
            — {app.url}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1.5">
          {/* External link */}
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded transition-all duration-150"
            style={{ width: "24px", height: "24px", color: "rgba(0,245,255,0.5)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background   = "rgba(0,245,255,0.1)";
              el.style.borderColor  = "rgba(0,245,255,0.3)";
              el.style.color        = "#00f5ff";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background   = "transparent";
              el.style.borderColor  = "transparent";
              el.style.color        = "rgba(0,245,255,0.5)";
            }}
          >
            <ExternalLink size={11} />
          </a>

          {/* Minimize */}
          <button
            type="button"
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded transition-all duration-150"
            style={{ width: "24px", height: "24px", background: "rgba(255,200,0,0.06)", border: "1px solid rgba(255,200,0,0.2)", color: "rgba(255,200,0,0.7)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background   = "rgba(255,200,0,0.15)";
              el.style.borderColor  = "rgba(255,200,0,0.5)";
              el.style.boxShadow    = "0 0 8px rgba(255,200,0,0.4)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background   = "rgba(255,200,0,0.06)";
              el.style.borderColor  = "rgba(255,200,0,0.2)";
              el.style.boxShadow    = "none";
            }}
          >
            <Minus size={11} />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded transition-all duration-150"
            style={{ width: "24px", height: "24px", background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.2)", color: "rgba(255,80,80,0.7)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background   = "rgba(255,50,50,0.2)";
              el.style.borderColor  = "rgba(255,50,50,0.6)";
              el.style.boxShadow    = "0 0 10px rgba(255,50,50,0.5)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background   = "rgba(255,50,50,0.06)";
              el.style.borderColor  = "rgba(255,50,50,0.2)";
              el.style.boxShadow    = "none";
            }}
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Content iframe */}
      <div className="relative" style={{ width: "100%", height: "calc(100% - 40px)" }}>
        <iframe
          src={app.url}
          title={app.name}
          className="w-full h-full"
          style={{ border: "none", display: "block" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
        {/* Neon corner accents */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: "20px", height: "20px", borderLeft: `2px solid ${app.color}66`, borderTop: `2px solid ${app.color}66` }}
        />
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{ width: "20px", height: "20px", borderRight: `2px solid ${app.color}66`, borderBottom: `2px solid ${app.color}66` }}
        />
      </div>
    </div>
  );
}
