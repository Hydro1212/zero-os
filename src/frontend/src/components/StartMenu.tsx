import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import type { App, Settings } from "../backend.d";

interface Props {
  apps: App[];
  settings: Settings;
  onClose: () => void;
  onAppLaunch: (app: App) => void;
  onAddApp: () => void;
}

export function StartMenu({ apps, settings, onClose, onAppLaunch, onAddApp }: Props) {
  const [search, setSearch] = useState("");

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => Number(a.order) - Number(b.order));

  const isBottom = settings.taskbarPosition === "bottom";

  const handleAppClick = (app: App) => {
    onAppLaunch(app);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: "transparent" }}
        aria-label="Close start menu"
      />

      {/* Start Menu Panel — spring open animation */}
      <div
        className="fixed z-50 animate-startmenu-open rounded-2xl overflow-hidden"
        style={{
          width: "480px",
          maxHeight: "520px",
          left: "50%",
          [isBottom ? "bottom" : "top"]: "60px",
          background: "rgba(4, 4, 18, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(0, 245, 255, 0.25)",
          boxShadow: "0 -8px 40px rgba(0,245,255,0.08), 0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,245,255,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: "1px solid rgba(0,245,255,0.08)" }}
        >
          <h2
            className="font-orbitron text-white"
            style={{
              fontSize: "13px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#00f5ff",
              textShadow: "0 0 12px rgba(0,245,255,0.5)",
            }}
          >
            ⬡ Zero OS
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full transition-all duration-150 flex items-center justify-center"
            style={{
              width: "24px",
              height: "24px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,50,50,0.15)";
              el.style.borderColor = "rgba(255,50,50,0.4)";
              el.style.color = "#ff4444";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,255,255,0.05)";
              el.style.borderColor = "rgba(255,255,255,0.1)";
              el.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X size={12} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(0,245,255,0.45)" }}
            />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neon-input w-full rounded-lg font-rajdhani"
              style={{
                paddingLeft: "32px",
                paddingRight: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                fontSize: "13px",
              }}
              
            />
          </div>
        </div>

        {/* Apps grid */}
        <div
          className="px-5 pb-4"
          style={{
            maxHeight: "340px",
            overflowY: "auto",
          }}
        >
          {sorted.length === 0 ? (
            <div
              className="text-center py-8 font-rajdhani"
              style={{ color: "rgba(0,245,255,0.35)", fontSize: "13px" }}
            >
              {search ? `No apps matching "${search}"` : "No apps yet. Add one below!"}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {sorted.map((app) => (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150 group"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = `${app.color}15`;
                    el.style.borderColor = `${app.color}55`;
                    el.style.boxShadow = `0 0 16px ${app.color}33`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.03)";
                    el.style.borderColor = "rgba(255,255,255,0.06)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <span style={{ fontSize: "24px", lineHeight: 1 }}>{app.emoji}</span>
                  <span
                    className="font-rajdhani text-center"
                    style={{
                      fontSize: "11px",
                      color: "rgba(220,235,255,0.8)",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "72px",
                      display: "block",
                    }}
                  >
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(0,245,255,0.08)" }}
        >
          <span
            className="font-share-tech"
            style={{ fontSize: "10px", color: "rgba(0,245,255,0.3)", letterSpacing: "0.1em" }}
          >
            {apps.length} APP{apps.length !== 1 ? "S" : ""} INSTALLED
          </span>
          <button
            type="button"
            onClick={() => { onAddApp(); onClose(); }}
            className="flex items-center gap-1.5 rounded-lg transition-all duration-150 neon-btn-cyan"
            style={{ padding: "6px 12px" }}
          >
            <Plus size={12} />
            New App
          </button>
        </div>
      </div>
    </>
  );
}
