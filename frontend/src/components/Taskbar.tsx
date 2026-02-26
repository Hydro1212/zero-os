import React, { useState, useEffect } from "react";
import { Plus, Settings } from "lucide-react";
import { ClockFormat, TaskbarHeight } from "../backend";

interface TaskbarApp {
  id: string;
  name: string;
  minimized: boolean;
}

interface TaskbarProps {
  apps: TaskbarApp[];
  onAppClick: (id: string) => void;
  onAddApp: () => void;
  onOpenSettings: () => void;
  taskbarHeight?: "compact" | "normal" | "tall";
  accentColor?: "cyan" | "magenta" | "green";
  clockFormat?: "hour12" | "hour24";
}

function getBarHeight(height: string | undefined): number {
  if (height === TaskbarHeight.compact) return 44;
  if (height === TaskbarHeight.tall) return 72;
  return 56;
}

export default function Taskbar({
  apps,
  onAppClick,
  onAddApp,
  onOpenSettings,
  taskbarHeight,
  accentColor = "cyan",
  clockFormat,
}: TaskbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const barHeight = getBarHeight(taskbarHeight);
  const iconSize = barHeight < 50 ? 14 : barHeight > 60 ? 20 : 16;
  const logoSize = barHeight < 50 ? 20 : barHeight > 60 ? 30 : 24;

  const formatTime = (date: Date) => {
    const use12 = clockFormat === ClockFormat.hour12;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: use12,
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const accentCyan = "oklch(0.85 0.2 195)";
  const accentMagenta = "oklch(0.75 0.25 320)";
  const accentGreen = "oklch(0.8 0.2 145)";
  const accent =
    accentColor === "magenta"
      ? accentMagenta
      : accentColor === "green"
      ? accentGreen
      : accentCyan;

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    border: `1px solid ${accent}40`,
    background: `${accent}10`,
    color: accent,
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: barHeight,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        background: "oklch(0.06 0.03 240 / 0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: `0 -2px 20px ${accent}26, 0 -1px 0 ${accent}4d`,
        padding: "0 8px",
        gap: "4px",
      }}
    >
      {/* Neon top border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${accent}cc 20%, oklch(0.75 0.25 320 / 0.8) 50%, ${accent}cc 80%, transparent 100%)`,
          boxShadow: `0 0 8px ${accent}80`,
        }}
      />

      {/* Logo / Add App */}
      <button
        onClick={onAddApp}
        title="Install App"
        style={{
          ...btnBase,
          padding: "0 10px",
          height: barHeight - 12,
          minWidth: barHeight - 12,
          gap: "6px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = `${accent}26`;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px ${accent}80`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = `${accent}1a`;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        <img
          src="/assets/generated/zero-os-logo.dim_128x128.png"
          alt="Zero OS"
          style={{
            width: logoSize,
            height: logoSize,
            objectFit: "contain",
            filter: `drop-shadow(0 0 4px ${accent}cc)`,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <Plus
          size={iconSize}
          style={{ color: accent, filter: `drop-shadow(0 0 4px ${accent})` }}
        />
      </button>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: barHeight - 20,
          background: `${accent}33`,
          flexShrink: 0,
          margin: "0 4px",
        }}
      />

      {/* Open Windows */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          overflow: "hidden",
          padding: "0 4px",
        }}
      >
        {apps.length === 0 && (
          <span
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "10px",
              color: "oklch(0.5 0.05 240)",
              letterSpacing: "0.1em",
              paddingLeft: "8px",
            }}
          >
            NO ACTIVE WINDOWS
          </span>
        )}
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 10px",
              height: barHeight - 14,
              maxWidth: "160px",
              borderRadius: "6px",
              border: app.minimized
                ? "1px solid oklch(0.75 0.25 320 / 0.4)"
                : `1px solid ${accent}66`,
              background: app.minimized
                ? "oklch(0.75 0.25 320 / 0.08)"
                : `${accent}1a`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                flexShrink: 0,
                background: app.minimized ? "oklch(0.75 0.25 320)" : accent,
                boxShadow: app.minimized
                  ? "0 0 6px oklch(0.75 0.25 320)"
                  : `0 0 6px ${accent}`,
              }}
            />
            <span
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "11px",
                color: app.minimized ? "oklch(0.75 0.25 320)" : accent,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
              }}
            >
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: barHeight - 20,
          background: `${accent}33`,
          flexShrink: 0,
          margin: "0 4px",
        }}
      />

      {/* Right: Settings + Clock */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            ...btnBase,
            width: barHeight - 14,
            height: barHeight - 14,
            border: "1px solid oklch(0.75 0.25 320 / 0.3)",
            background: "oklch(0.75 0.25 320 / 0.08)",
            color: "oklch(0.75 0.25 320)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.75 0.25 320 / 0.2)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 12px oklch(0.75 0.25 320 / 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.75 0.25 320 / 0.08)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <Settings
            size={iconSize}
            style={{
              filter: "drop-shadow(0 0 4px oklch(0.75 0.25 320 / 0.8))",
            }}
          />
        </button>

        {/* Clock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 10px",
            height: barHeight - 10,
            borderRadius: "6px",
            border: `1px solid ${accent}33`,
            background: `${accent}0d`,
            minWidth: "110px",
          }}
        >
          <span
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize:
                barHeight < 50 ? "11px" : barHeight > 60 ? "15px" : "13px",
              color: accent,
              letterSpacing: "0.08em",
              lineHeight: 1.2,
              textShadow: `0 0 8px ${accent}99`,
              fontWeight: 600,
            }}
          >
            {formatTime(time)}
          </span>
          <span
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: barHeight < 50 ? "8px" : "9px",
              color: `${accent}99`,
              letterSpacing: "0.1em",
              lineHeight: 1.2,
            }}
          >
            {formatDate(time)}
          </span>
        </div>
      </div>
    </div>
  );
}
