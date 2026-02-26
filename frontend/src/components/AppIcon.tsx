import React, { useState } from "react";

interface AppIconProps {
  id: string;
  name: string;
  url: string;
  isOpen: boolean;
  isMinimized: boolean;
  onOpen: () => void;
  onRemove?: () => void;
  iconSize: "small" | "medium" | "large";
  fontSize: "small" | "medium" | "large";
}

function getIconDimensions(size: "small" | "medium" | "large"): {
  container: number;
  img: number;
} {
  switch (size) {
    case "small":
      return { container: 56, img: 28 };
    case "large":
      return { container: 88, img: 44 };
    default:
      return { container: 72, img: 36 };
  }
}

function getLabelFontSize(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "9px";
    case "large":
      return "13px";
    default:
      return "11px";
  }
}

function getAppEmoji(url: string, name: string): string {
  if (url === "internal://settings") return "⚙️";
  const lower = name.toLowerCase();
  if (lower.includes("mail") || lower.includes("email")) return "📧";
  if (lower.includes("music") || lower.includes("spotify")) return "🎵";
  if (lower.includes("video") || lower.includes("youtube")) return "🎬";
  if (lower.includes("code") || lower.includes("github")) return "💻";
  if (lower.includes("chat") || lower.includes("discord")) return "💬";
  if (lower.includes("map")) return "🗺️";
  if (lower.includes("photo") || lower.includes("image")) return "🖼️";
  if (lower.includes("game")) return "🎮";
  if (lower.includes("news")) return "📰";
  if (lower.includes("shop") || lower.includes("store")) return "🛒";
  if (
    lower.includes("twitter") ||
    lower.includes("x.com") ||
    lower.includes("social")
  )
    return "🐦";
  return "🌐";
}

export default function AppIcon({
  id,
  name,
  url,
  isOpen,
  isMinimized,
  onOpen,
  onRemove,
  iconSize,
  fontSize,
}: AppIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const dims = getIconDimensions(iconSize);
  const labelSize = getLabelFontSize(fontSize);
  const emoji = getAppEmoji(url, name);

  function handleContextMenu(e: React.MouseEvent) {
    if (!onRemove) return;
    e.preventDefault();
    setShowContext(true);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setShowContext(false);
    onRemove?.();
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={onOpen}
      onContextMenu={handleContextMenu}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        background: isHovered ? "oklch(0.85 0.2 195 / 0.1)" : "transparent",
        transform: isHovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: dims.container,
          height: dims.container,
          borderRadius: "12px",
          background: isHovered
            ? "oklch(0.12 0.04 240 / 0.9)"
            : "oklch(0.1 0.03 240 / 0.7)",
          border: isHovered
            ? "1px solid oklch(0.85 0.2 195 / 0.7)"
            : "1px solid oklch(0.85 0.2 195 / 0.25)",
          boxShadow: isHovered
            ? "0 0 16px oklch(0.85 0.2 195 / 0.5), 0 0 32px oklch(0.85 0.2 195 / 0.2)"
            : "0 0 8px oklch(0.85 0.2 195 / 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
          fontSize: dims.img * 0.7,
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            width: 6,
            height: 6,
            borderTop: "1px solid oklch(0.85 0.2 195 / 0.6)",
            borderLeft: "1px solid oklch(0.85 0.2 195 / 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 6,
            height: 6,
            borderTop: "1px solid oklch(0.85 0.2 195 / 0.6)",
            borderRight: "1px solid oklch(0.85 0.2 195 / 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: 3,
            width: 6,
            height: 6,
            borderBottom: "1px solid oklch(0.85 0.2 195 / 0.6)",
            borderLeft: "1px solid oklch(0.85 0.2 195 / 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 6,
            height: 6,
            borderBottom: "1px solid oklch(0.85 0.2 195 / 0.6)",
            borderRight: "1px solid oklch(0.85 0.2 195 / 0.6)",
          }}
        />
        {emoji}
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "Share Tech Mono, monospace",
          fontSize: labelSize,
          color: "oklch(0.92 0.05 195)",
          textAlign: "center",
          maxWidth: dims.container + 16,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: "0 0 8px oklch(0.85 0.2 195 / 0.5)",
          letterSpacing: "0.05em",
        }}
      >
        {name}
      </span>

      {/* Status indicator */}
      {(isOpen || isMinimized) && (
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMinimized ? 6 : 8,
            height: 3,
            borderRadius: "2px",
            background: isMinimized
              ? "oklch(0.75 0.25 320)"
              : "oklch(0.85 0.2 195)",
            boxShadow: isMinimized
              ? "0 0 6px oklch(0.75 0.25 320)"
              : "0 0 8px oklch(0.85 0.2 195)",
          }}
        />
      )}

      {/* Context menu */}
      {showContext && onRemove && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setShowContext(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "4px",
              zIndex: 9999,
              borderRadius: "6px",
              border: "1px solid oklch(0.85 0.2 195 / 0.3)",
              background: "oklch(0.08 0.02 240 / 0.97)",
              boxShadow: "0 0 20px oklch(0.85 0.2 195 / 0.1)",
              minWidth: "120px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContext(false);
                onOpen();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                fontSize: "11px",
                fontFamily: "Share Tech Mono, monospace",
                color: "oklch(0.85 0.2 195 / 0.8)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.85 0.2 195 / 0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              Open
            </button>
            <div
              style={{
                height: "1px",
                background: "oklch(0.85 0.2 195 / 0.1)",
              }}
            />
            <button
              onClick={handleRemove}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                fontSize: "11px",
                fontFamily: "Share Tech Mono, monospace",
                color: "oklch(0.65 0.25 25)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.65 0.25 25 / 0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              Remove App
            </button>
          </div>
        </>
      )}
    </div>
  );
}
