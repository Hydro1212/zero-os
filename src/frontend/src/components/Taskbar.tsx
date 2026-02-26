import { useState, useEffect, useRef, useCallback } from "react";
import { Settings as SettingsIcon, Grid3X3 } from "lucide-react";
import type { App, Settings } from "../backend.d";

interface Props {
  apps: App[];
  settings: Settings;
  onStartClick: () => void;
  onSettingsClick: () => void;
  onAppLaunch: (app: App) => void;
  startOpen: boolean;
  desktopReady?: boolean;
}

export function Taskbar({
  apps,
  settings,
  onStartClick,
  onSettingsClick,
  onAppLaunch,
  startOpen,
  desktopReady = false,
}: Props) {
  const [time, setTime] = useState(new Date());
  const [rippleKey, setRippleKey] = useState(0);
  const [showRipple, setShowRipple] = useState(false);
  const rippleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pinnedApps = [...apps]
    .sort((a, b) => Number(a.order) - Number(b.order))
    .slice(0, 6);

  const isBottom = settings.taskbarPosition === "bottom";

  const formatTime = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatDate = (d: Date) => {
    const days   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
  };

  // Start button ripple
  const handleStartClick = useCallback(() => {
    setRippleKey((k) => k + 1);
    setShowRipple(true);
    if (rippleTimer.current) clearTimeout(rippleTimer.current);
    rippleTimer.current = setTimeout(() => setShowRipple(false), 600);
    onStartClick();
  }, [onStartClick]);

  useEffect(() => {
    return () => {
      if (rippleTimer.current) clearTimeout(rippleTimer.current);
    };
  }, []);

  // Slide-in animation class
  const animClass = desktopReady
    ? isBottom ? "animate-taskbar-bottom" : "animate-taskbar-top"
    : "";

  return (
    <div
      className={`fixed left-0 right-0 z-40 flex items-center px-3 ${animClass}`}
      style={{
        [isBottom ? "bottom" : "top"]: 0,
        height: "52px",
        background: "rgba(4, 4, 20, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop:    isBottom ? "1px solid rgba(0, 245, 255, 0.3)" : "none",
        borderBottom: !isBottom ? "1px solid rgba(0, 245, 255, 0.3)" : "none",
        boxShadow: isBottom
          ? "0 -4px 30px rgba(0, 245, 255, 0.08)"
          : "0 4px 30px rgba(0, 245, 255, 0.08)",
      }}
    >
      {/* Start Button */}
      <button
        type="button"
        onClick={handleStartClick}
        className="flex items-center justify-center rounded-md transition-all duration-150 relative overflow-hidden"
        style={{
          width: "42px",
          height: "38px",
          background: startOpen ? "rgba(0, 245, 255, 0.15)" : "rgba(0, 245, 255, 0.06)",
          border: `1px solid rgba(0, 245, 255, ${startOpen ? "0.5" : "0.2"})`,
          boxShadow: startOpen ? "0 0 15px rgba(0, 245, 255, 0.4), inset 0 0 15px rgba(0, 245, 255, 0.05)" : "none",
        }}
        title="Start Menu"
      >
        <Grid3X3
          size={18}
          style={{ color: startOpen ? "#00f5ff" : "rgba(0, 245, 255, 0.8)" }}
        />

        {/* Radial neon burst ripple */}
        {showRipple && (
          <span
            key={rippleKey}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,245,255,0.55) 0%, rgba(0,245,255,0) 70%)",
              transform: "translate(-50%, -50%) scale(0)",
              animation: "start-ripple 0.55s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Active glow overlay */}
        {startOpen && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)",
            }}
          />
        )}
      </button>

      {/* Divider */}
      <div
        className="mx-3 h-6 w-px"
        style={{ background: "rgba(0, 245, 255, 0.15)" }}
      />

      {/* Pinned App Icons */}
      <div className="flex items-center gap-1.5 flex-1">
        {pinnedApps.map((app) => (
          <button
            type="button"
            key={app.id}
            onClick={() => onAppLaunch(app)}
            className="taskbar-icon flex items-center justify-center rounded-md"
            style={{
              width: "38px",
              height: "38px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "18px",
              lineHeight: 1,
            }}
            title={app.name}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = `${app.color}22`;
              el.style.borderColor = `${app.color}66`;
              el.style.boxShadow = `0 0 12px ${app.color}44`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(255,255,255,0.04)";
              el.style.borderColor = "rgba(255,255,255,0.08)";
              el.style.boxShadow = "none";
            }}
          >
            {app.emoji}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Settings Button */}
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex items-center justify-center rounded-md transition-all duration-150"
          style={{
            width: "38px",
            height: "38px",
            background: "rgba(191, 0, 255, 0.06)",
            border: "1px solid rgba(191, 0, 255, 0.2)",
          }}
          title="Settings"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(191, 0, 255, 0.15)";
            el.style.borderColor = "rgba(191, 0, 255, 0.5)";
            el.style.boxShadow = "0 0 15px rgba(191, 0, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(191, 0, 255, 0.06)";
            el.style.borderColor = "rgba(191, 0, 255, 0.2)";
            el.style.boxShadow = "none";
          }}
        >
          <SettingsIcon size={16} style={{ color: "rgba(191, 0, 255, 0.85)" }} />
        </button>

        {/* Clock */}
        {settings.showClock && (
          <div
            className="text-right font-mono-tech"
            style={{
              minWidth: "90px",
              padding: "0 8px",
              borderLeft: "1px solid rgba(0, 245, 255, 0.12)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#00f5ff",
                letterSpacing: "0.05em",
                textShadow: "0 0 8px rgba(0,245,255,0.5)",
              }}
            >
              {formatTime(time)}
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "rgba(0, 245, 255, 0.5)",
                letterSpacing: "0.1em",
              }}
            >
              {formatDate(time)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
