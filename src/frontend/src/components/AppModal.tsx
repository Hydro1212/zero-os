import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { App } from "../backend.d";

const EMOJI_LIST = [
  "▶️", "🐙", "🔍", "𝕏", "👽", "🚀", "💡", "📧", "🎵", "🎬",
  "📝", "🌐", "💻", "🎮", "📊", "🔗", "📷", "🗺️", "💬", "📰",
  "🔧", "⚡", "🌙", "🏠", "📦", "🎯", "💎", "🌟", "🔐", "🎨",
  "🤖", "🦊", "🐬", "🦁", "🐉", "🌈", "🍕", "☕", "🎲", "🏆",
];

interface Props {
  app?: App | null;
  onSave: (app: App) => void;
  onClose: () => void;
  existingAppsCount: number;
}

export function AppModal({ app, onSave, onClose, existingAppsCount }: Props) {
  const [name, setName] = useState(app?.name ?? "");
  const [url, setUrl] = useState(app?.url ?? "");
  const [emoji, setEmoji] = useState(app?.emoji ?? "🚀");
  const [color, setColor] = useState(app?.color ?? "#00f5ff");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    if (app) {
      setName(app.name);
      setUrl(app.url);
      setEmoji(app.emoji);
      setColor(app.color);
    }
  }, [app]);

  const validateUrl = (val: string): boolean => {
    try {
      const u = new URL(val.startsWith("http") ? val : `https://${val}`);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!validateUrl(normalizedUrl)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setUrlError("");

    const saved: App = {
      id: app?.id ?? crypto.randomUUID(),
      name: name.trim(),
      url: normalizedUrl,
      emoji,
      color,
      order: app?.order ?? BigInt(existingAppsCount),
    };
    onSave(saved);
  };

  const isEdit = !!app;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div
        className="fixed z-50 rounded-2xl overflow-hidden animate-modal-appear"
        style={{
          width: "460px",
          maxWidth: "calc(100vw - 32px)",
          top: "50%",
          left: "50%",
          background: "rgba(4, 4, 18, 0.97)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0,245,255,0.3)",
          boxShadow: "0 0 60px rgba(0,245,255,0.12), 0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,245,255,0.1)" }}
        >
          <h2
            className="font-orbitron"
            style={{
              fontSize: "13px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#00f5ff",
              textShadow: "0 0 10px rgba(0,245,255,0.5)",
            }}
          >
            {isEdit ? "✎ Edit App" : "+ New App"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all duration-150"
            style={{
              width: "26px",
              height: "26px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,50,50,0.15)";
              el.style.borderColor = "rgba(255,50,50,0.4)";
              el.style.color = "#ff5555";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,255,255,0.05)";
              el.style.borderColor = "rgba(255,255,255,0.12)";
              el.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="app-name"
              className="block font-orbitron mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(0,245,255,0.55)", textTransform: "uppercase" }}
            >
              App Name
            </label>
            <input
              id="app-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. YouTube"
              className="neon-input w-full rounded-lg font-rajdhani"
              style={{ padding: "9px 12px", fontSize: "14px" }}
            />
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="app-url"
              className="block font-orbitron mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(0,245,255,0.55)", textTransform: "uppercase" }}
            >
              URL
            </label>
            <input
              id="app-url"
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
              placeholder="https://example.com"
              className="neon-input w-full rounded-lg font-rajdhani"
              style={{ padding: "9px 12px", fontSize: "14px" }}
            />
            {urlError && (
              <p style={{ fontSize: "11px", color: "#ff5555", marginTop: "4px" }}>{urlError}</p>
            )}
          </div>

          {/* Emoji picker */}
          <div>
            <label
              htmlFor="app-emoji-input"
              className="block font-orbitron mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(0,245,255,0.55)", textTransform: "uppercase" }}
            >
              Icon Emoji
            </label>
            <div
              className="rounded-lg p-2"
              style={{
                background: "rgba(0,245,255,0.03)",
                border: "1px solid rgba(0,245,255,0.1)",
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: "4px",
              }}
            >
              {EMOJI_LIST.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="flex items-center justify-center rounded-md transition-all duration-100"
                  style={{
                    height: "32px",
                    fontSize: "18px",
                    background: emoji === e ? "rgba(0,245,255,0.15)" : "transparent",
                    border: emoji === e ? "1px solid rgba(0,245,255,0.4)" : "1px solid transparent",
                    boxShadow: emoji === e ? "0 0 8px rgba(0,245,255,0.3)" : "none",
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                  title={e}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Custom emoji input */}
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: "11px", color: "rgba(0,245,255,0.4)" }}>Or type:</span>
              <input
                id="app-emoji-input"
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
                maxLength={2}
                className="neon-input rounded font-rajdhani text-center"
                style={{ width: "50px", padding: "4px", fontSize: "18px" }}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label
              htmlFor="app-color"
              className="block font-orbitron mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(0,245,255,0.55)", textTransform: "uppercase" }}
            >
              Neon Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="app-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: "48px",
                  height: "36px",
                  border: "1px solid rgba(0,245,255,0.3)",
                  borderRadius: "6px",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "2px",
                }}
              />
              {/* Preset swatches */}
              {["#00f5ff", "#bf00ff", "#ff00a0", "#ff4500", "#00ff88", "#ffd700"].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="rounded-full transition-all duration-100"
                  style={{
                    width: "24px",
                    height: "24px",
                    background: c,
                    border: color === c ? "2px solid white" : "2px solid transparent",
                    boxShadow: `0 0 8px ${c}88`,
                    cursor: "pointer",
                  }}
                  title={c}
                />
              ))}
              <span
                className="font-share-tech"
                style={{ fontSize: "12px", color: color, textShadow: `0 0 6px ${color}` }}
              >
                {color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid rgba(0,245,255,0.1)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="neon-btn-danger rounded-lg"
            style={{ padding: "8px 20px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !url.trim()}
            className="neon-btn-cyan rounded-lg flex items-center gap-1.5"
            style={{
              padding: "8px 24px",
              opacity: !name.trim() || !url.trim() ? 0.4 : 1,
            }}
          >
            <Check size={13} />
            {isEdit ? "Update" : "Add App"}
          </button>
        </div>
      </div>
    </>
  );
}
