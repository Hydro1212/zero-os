import { useState, useRef, useCallback, useEffect } from "react";
import { X, Monitor, Cpu, Grid3X3, Pencil, Trash2, Minus } from "lucide-react";
import type { App, Settings } from "../backend.d";

interface Props {
  settings: Settings;
  apps: App[];
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
  onAppEdit: (app: App) => void;
  onAppDelete: (appId: string) => void;
  zIndex: number;
  onFocus: () => void;
}

type Section = "appearance" | "system" | "apps";

export function SettingsWindow({
  settings,
  apps,
  onClose,
  onSettingsChange,
  onAppEdit,
  onAppDelete,
  zIndex,
  onFocus,
}: Props) {
  const [section, setSection] = useState<Section>("appearance");
  const [pos, setPos] = useState({ x: 120, y: 60 });
  const [minimized, setMinimized] = useState(false);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const W = 700;
  const H = 500;

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
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - W));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - H));
      setPos({ x: newX, y: newY });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const update = (partial: Partial<Settings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Section; icon: React.ElementType; label: string }) => (
    <button
      type="button"
      onClick={() => setSection(id)}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-left font-rajdhani"
      style={{
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: section === id ? "rgba(0,245,255,0.1)" : "transparent",
        color: section === id ? "#00f5ff" : "rgba(200,220,255,0.6)",
        borderLeft: section === id ? "2px solid #00f5ff" : "2px solid transparent",
        boxShadow: section === id ? "0 0 12px rgba(0,245,255,0.15)" : "none",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  if (minimized) return null;

  return (
    <div
      role="dialog"
      aria-label="Settings"
      className="fixed animate-window-open rounded-xl overflow-hidden"
      style={{
        left: pos.x,
        top: pos.y,
        width: W,
        height: H,
        zIndex,
        background: "rgba(3, 3, 15, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(191,0,255,0.35)",
        boxShadow: "0 0 40px rgba(191,0,255,0.12), 0 24px 60px rgba(0,0,0,0.7)",
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        role="toolbar"
        aria-label="Settings window controls"
        className="window-titlebar flex items-center justify-between px-4"
        style={{
          height: "40px",
          background: "linear-gradient(90deg, rgba(3,3,15,0.95) 0%, rgba(191,0,255,0.08) 100%)",
          borderBottom: "1px solid rgba(191,0,255,0.25)",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "#bf00ff", fontSize: "14px" }}>⚙</span>
          <span
            className="font-orbitron"
            style={{
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: "#bf00ff",
              textShadow: "0 0 8px rgba(191,0,255,0.6)",
              textTransform: "uppercase",
            }}
          >
            Settings
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMinimized(true)}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded transition-all duration-150"
            style={{
              width: "24px", height: "24px",
              background: "rgba(255,200,0,0.06)", border: "1px solid rgba(255,200,0,0.2)", color: "rgba(255,200,0,0.7)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,200,0,0.15)";
              el.style.boxShadow = "0 0 8px rgba(255,200,0,0.4)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,200,0,0.06)";
              el.style.boxShadow = "none";
            }}
          >
            <Minus size={11} />
          </button>
          <button
            type="button"
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded transition-all duration-150"
            style={{
              width: "24px", height: "24px",
              background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.2)", color: "rgba(255,80,80,0.7)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,50,50,0.2)";
              el.style.boxShadow = "0 0 10px rgba(255,50,50,0.5)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,50,50,0.06)";
              el.style.boxShadow = "none";
            }}
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex" style={{ height: "calc(100% - 40px)" }}>
        {/* Sidebar */}
        <nav
          className="flex flex-col gap-1 p-3"
          style={{
            width: "160px",
            borderRight: "1px solid rgba(191,0,255,0.15)",
            flexShrink: 0,
          }}
        >
          <NavItem id="appearance" icon={Monitor} label="Appearance" />
          <NavItem id="system" icon={Cpu} label="System" />
          <NavItem id="apps" icon={Grid3X3} label="Apps" />

          <div style={{ flex: 1 }} />
          <div
            className="font-share-tech text-center"
            style={{ fontSize: "9px", color: "rgba(191,0,255,0.25)", letterSpacing: "0.1em" }}
          >
            ZERO OS v1.0
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {section === "appearance" && (
            <div className="space-y-5">
              <h3
                className="font-orbitron"
                style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(191,0,255,0.7)", textTransform: "uppercase" }}
              >
                Appearance
              </h3>

              <div>
                <label
                  htmlFor="bg-effect"
                  className="block font-orbitron mb-2"
                  style={{ fontSize: "9px", letterSpacing: "0.12em", color: "rgba(200,200,255,0.5)", textTransform: "uppercase" }}
                >
                  Background Effect
                </label>
                <select
                  id="bg-effect"
                  value={settings.backgroundEffect}
                  onChange={(e) => update({ backgroundEffect: e.target.value })}
                  className="neon-select w-full"
                  style={{ fontSize: "13px" }}
                >
                  <option value="grid">Neon Grid</option>
                  <option value="particles">Floating Particles</option>
                  <option value="none">None (wallpaper only)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wallpaper"
                  className="block font-orbitron mb-2"
                  style={{ fontSize: "9px", letterSpacing: "0.12em", color: "rgba(200,200,255,0.5)", textTransform: "uppercase" }}
                >
                  Wallpaper (CSS color or gradient)
                </label>
                <input
                  id="wallpaper"
                  type="text"
                  value={settings.wallpaper}
                  onChange={(e) => update({ wallpaper: e.target.value })}
                  placeholder="#050510 or linear-gradient(...)"
                  className="neon-input w-full rounded-lg font-rajdhani"
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
                <div
                  className="mt-2 rounded-lg"
                  style={{
                    height: "32px",
                    background: settings.wallpaper,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="accent-color"
                  className="block font-orbitron mb-2"
                  style={{ fontSize: "9px", letterSpacing: "0.12em", color: "rgba(200,200,255,0.5)", textTransform: "uppercase" }}
                >
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="accent-color"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => update({ accentColor: e.target.value })}
                    style={{
                      width: "48px", height: "36px",
                      border: "1px solid rgba(191,0,255,0.3)", borderRadius: "6px",
                      background: "transparent", cursor: "pointer", padding: "2px",
                    }}
                  />
                  <span
                    className="font-share-tech"
                    style={{ color: settings.accentColor, fontSize: "14px", textShadow: `0 0 8px ${settings.accentColor}` }}
                  >
                    {settings.accentColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {section === "system" && (
            <div className="space-y-5">
              <h3
                className="font-orbitron"
                style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(191,0,255,0.7)", textTransform: "uppercase" }}
              >
                System
              </h3>

              {/* Open in iframe toggle */}
              <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="font-rajdhani" style={{ fontWeight: 600, color: "rgba(220,235,255,0.9)", fontSize: "14px" }}>
                    Open Links
                  </div>
                  <div className="font-share-tech" style={{ fontSize: "11px", color: "rgba(200,200,255,0.4)", marginTop: "2px" }}>
                    {settings.openInIframe ? "Opens in floating window" : "Opens in new browser tab"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update({ openInIframe: !settings.openInIframe })}
                  className="rounded-full transition-all duration-200 relative"
                  style={{
                    width: "48px",
                    height: "26px",
                    background: settings.openInIframe ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.08)",
                    border: `1px solid ${settings.openInIframe ? "#00f5ff" : "rgba(255,255,255,0.15)"}`,
                    boxShadow: settings.openInIframe ? "0 0 10px rgba(0,245,255,0.3)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="rounded-full absolute top-1/2 transition-all duration-200"
                    style={{
                      width: "18px",
                      height: "18px",
                      background: settings.openInIframe ? "#00f5ff" : "rgba(255,255,255,0.3)",
                      transform: `translateY(-50%) translateX(${settings.openInIframe ? "25px" : "3px"})`,
                      boxShadow: settings.openInIframe ? "0 0 6px rgba(0,245,255,0.8)" : "none",
                    }}
                  />
                </button>
              </div>

              {/* Show clock toggle */}
              <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="font-rajdhani" style={{ fontWeight: 600, color: "rgba(220,235,255,0.9)", fontSize: "14px" }}>
                    Show Clock
                  </div>
                  <div className="font-share-tech" style={{ fontSize: "11px", color: "rgba(200,200,255,0.4)", marginTop: "2px" }}>
                    Display time and date in taskbar
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update({ showClock: !settings.showClock })}
                  className="rounded-full transition-all duration-200 relative"
                  style={{
                    width: "48px", height: "26px",
                    background: settings.showClock ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.08)",
                    border: `1px solid ${settings.showClock ? "#00f5ff" : "rgba(255,255,255,0.15)"}`,
                    boxShadow: settings.showClock ? "0 0 10px rgba(0,245,255,0.3)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="rounded-full absolute top-1/2 transition-all duration-200"
                    style={{
                      width: "18px", height: "18px",
                      background: settings.showClock ? "#00f5ff" : "rgba(255,255,255,0.3)",
                      transform: `translateY(-50%) translateX(${settings.showClock ? "25px" : "3px"})`,
                      boxShadow: settings.showClock ? "0 0 6px rgba(0,245,255,0.8)" : "none",
                    }}
                  />
                </button>
              </div>

              {/* Taskbar position */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-rajdhani" style={{ fontWeight: 600, color: "rgba(220,235,255,0.9)", fontSize: "14px" }}>
                    Taskbar Position
                  </div>
                  <div className="font-share-tech" style={{ fontSize: "11px", color: "rgba(200,200,255,0.4)", marginTop: "2px" }}>
                    Currently: {settings.taskbarPosition === "bottom" ? "Bottom" : "Top"}
                  </div>
                </div>
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(191,0,255,0.25)" }}>
                  {["bottom", "top"].map((pos) => (
                    <button
                      type="button"
                      key={pos}
                      onClick={() => update({ taskbarPosition: pos })}
                      className="transition-all duration-150 font-orbitron"
                      style={{
                        padding: "6px 14px",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: settings.taskbarPosition === pos ? "rgba(191,0,255,0.2)" : "transparent",
                        color: settings.taskbarPosition === pos ? "#bf00ff" : "rgba(200,200,255,0.4)",
                        borderRight: pos === "bottom" ? "1px solid rgba(191,0,255,0.25)" : "none",
                        boxShadow: settings.taskbarPosition === pos ? "0 0 10px rgba(191,0,255,0.2)" : "none",
                      }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "apps" && (
            <div className="space-y-4">
              <h3
                className="font-orbitron"
                style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(191,0,255,0.7)", textTransform: "uppercase" }}
              >
                Installed Apps ({apps.length})
              </h3>

              {apps.length === 0 ? (
                <div
                  className="text-center py-8 font-rajdhani"
                  style={{ color: "rgba(200,200,255,0.35)", fontSize: "13px" }}
                >
                  No apps installed yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {[...apps].sort((a, b) => Number(a.order) - Number(b.order)).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${app.color}22`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-lg shrink-0"
                        style={{
                          width: "36px", height: "36px", fontSize: "20px",
                          background: `${app.color}15`,
                          border: `1px solid ${app.color}33`,
                        }}
                      >
                        {app.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-rajdhani" style={{ fontWeight: 700, color: "rgba(220,235,255,0.9)", fontSize: "13px" }}>
                          {app.name}
                        </div>
                        <div
                          className="font-share-tech"
                          style={{
                            fontSize: "10px", color: "rgba(200,200,255,0.35)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}
                        >
                          {app.url}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAppEdit(app)}
                          className="flex items-center justify-center rounded transition-all duration-150"
                          style={{
                            width: "28px", height: "28px",
                            background: "rgba(191,0,255,0.06)", border: "1px solid rgba(191,0,255,0.2)", color: "rgba(191,0,255,0.7)",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(191,0,255,0.15)";
                            el.style.boxShadow = "0 0 8px rgba(191,0,255,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(191,0,255,0.06)";
                            el.style.boxShadow = "none";
                          }}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAppDelete(app.id)}
                          className="flex items-center justify-center rounded transition-all duration-150"
                          style={{
                            width: "28px", height: "28px",
                            background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.2)", color: "rgba(255,80,80,0.7)",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(255,50,50,0.15)";
                            el.style.boxShadow = "0 0 8px rgba(255,50,50,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(255,50,50,0.06)";
                            el.style.boxShadow = "none";
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
