import { useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import type { App, Settings } from "../backend.d";

interface ContextMenuState {
  x: number;
  y: number;
  app: App;
}

interface RippleState {
  id: number;
  x: number;
  y: number;
}

interface Props {
  apps: App[];
  settings: Settings;
  onAppLaunch: (app: App) => void;
  onAppEdit: (app: App) => void;
  onAppDelete: (appId: string) => void;
  onAddApp: () => void;
  onReorder: (apps: App[]) => void;
  desktopReady?: boolean;
}

export function DesktopIcons({
  apps,
  settings,
  onAppLaunch,
  onAppEdit,
  onAppDelete,
  onAddApp,
  onReorder,
  desktopReady = false,
}: Props) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draggedId,   setDraggedId]   = useState<string | null>(null);
  const [dragOverId,  setDragOverId]  = useState<string | null>(null);
  const [hoveredId,   setHoveredId]   = useState<string | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [ripples, setRipples]         = useState<RippleState[]>([]);
  const dragStartIndex = useRef<number>(-1);
  const rippleCounter  = useRef(0);

  const isBottom  = settings.taskbarPosition === "bottom";
  const sortedApps = [...apps].sort((a, b) => Number(a.order) - Number(b.order));

  const handleContextMenu = (e: React.MouseEvent, app: App) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, app });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleDragStart = (e: React.DragEvent, app: App, index: number) => {
    setDraggedId(app.id);
    dragStartIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, app: App) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(app.id);
  };

  const handleDrop = (e: React.DragEvent, targetApp: App, targetIndex: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetApp.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const newApps = [...sortedApps];
    const sourceIdx = dragStartIndex.current;
    const [removed] = newApps.splice(sourceIdx, 1);
    newApps.splice(targetIndex, 0, removed);
    const reordered = newApps.map((a, i) => ({ ...a, order: BigInt(i) }));
    onReorder(reordered);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Launch with pulse + ripple animation
  const handleLaunch = useCallback((app: App, e: React.MouseEvent) => {
    // Ripple at click position
    const id = ++rippleCounter.current;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width  / 2;
    const y = rect.top  + rect.height / 2;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);

    // Scale pulse on the icon
    setLaunchingId(app.id);
    setTimeout(() => setLaunchingId(null), 350);

    onAppLaunch(app);
  }, [onAppLaunch]);

  return (
    <>
      {/* Desktop icon grid */}
      <div
        className="fixed inset-0 p-4"
        style={{
          paddingTop:    isBottom ? "16px" : "68px",
          paddingBottom: isBottom ? "68px" : "16px",
          display:              "grid",
          gridTemplateColumns:  "repeat(auto-fill, 88px)",
          gridAutoRows:         "min-content",
          alignContent:         "start",
          gap:                  "12px",
        }}
      >
        {sortedApps.map((app, index) => {
          const isLaunching = launchingId === app.id;
          const isHovered   = hoveredId   === app.id;

          return (
            <button
              type="button"
              key={app.id}
              draggable
              onDragStart={(e) => handleDragStart(e, app, index)}
              onDragOver={(e)  => handleDragOver(e, app)}
              onDrop={(e)      => handleDrop(e, app, index)}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleContextMenu(e, app)}
              onDoubleClick={(e) => handleLaunch(app, e)}
              onClick={closeContextMenu}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAppLaunch(app);
              }}
              onMouseEnter={() => setHoveredId(app.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
              style={{
                width:       "88px",
                cursor:      "pointer",
                userSelect:  "none",
                outline:     "none",
                border:      "none",
                background:  dragOverId === app.id ? "rgba(0,245,255,0.08)" : "transparent",
                opacity:     draggedId === app.id ? 0.3 : 1,
                // Stagger on desktop reveal
                animation:   desktopReady
                  ? `icon-appear 0.4s cubic-bezier(0.34,1.3,0.64,1) ${index * 50}ms both`
                  : "none",
                // Launch pulse overrides hover transform
                transform:   isLaunching ? undefined : isHovered ? "translateY(-4px)" : "translateY(0)",
                transition:  isLaunching ? "none" : "transform 0.2s ease",
              }}
            >
              {/* Icon box */}
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width:         "64px",
                  height:        "64px",
                  fontSize:      "28px",
                  background:    isHovered ? `${app.color}18` : "rgba(8, 8, 25, 0.7)",
                  backdropFilter:"blur(12px)",
                  border:        `1px solid ${isHovered ? `${app.color}88` : `${app.color}33`}`,
                  boxShadow:     isHovered
                    ? `0 0 24px ${app.color}66, 0 4px 16px rgba(0,0,0,0.5)`
                    : "0 2px 12px rgba(0,0,0,0.5)",
                  lineHeight:    1,
                  transition:    "all 0.2s ease",
                  // Launch pulse animation
                  animation:     isLaunching ? "icon-launch-pulse 0.3s ease-out forwards" : "none",
                }}
              >
                {app.emoji}
              </div>

              {/* App name */}
              <span
                className="text-center font-rajdhani leading-tight"
                style={{
                  fontSize:      "11px",
                  color:         "rgba(220, 240, 255, 0.9)",
                  fontWeight:    600,
                  textShadow:    "0 1px 4px rgba(0,0,0,0.8)",
                  maxWidth:      "80px",
                  overflow:      "hidden",
                  textOverflow:  "ellipsis",
                  whiteSpace:    "nowrap",
                  display:       "block",
                }}
              >
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Neon ripple overlays */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none"
          style={{
            left: r.x,
            top:  r.y,
            width:  "60px",
            height: "60px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,255,0.5) 0%, rgba(0,245,255,0) 70%)",
            animation: "icon-ripple 0.65s ease-out forwards",
            zIndex: 200,
          }}
        />
      ))}

      {/* Add App FAB */}
      <button
        type="button"
        onClick={onAddApp}
        className="fixed z-30 flex items-center gap-2 rounded-xl transition-all duration-200 font-orbitron"
        style={{
          right:   "24px",
          bottom:  isBottom ? "68px" : "auto",
          top:     !isBottom ? "68px" : "auto",
          padding: "10px 18px",
          background:   "rgba(0, 245, 255, 0.08)",
          border:       "1px solid rgba(0, 245, 255, 0.35)",
          color:        "#00f5ff",
          fontSize:     "11px",
          letterSpacing:"0.08em",
          textTransform:"uppercase",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background  = "rgba(0, 245, 255, 0.16)";
          el.style.boxShadow   = "0 0 20px rgba(0,245,255,0.4), 0 0 40px rgba(0,245,255,0.15)";
          el.style.borderColor = "rgba(0, 245, 255, 0.7)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background  = "rgba(0, 245, 255, 0.08)";
          el.style.boxShadow   = "none";
          el.style.borderColor = "rgba(0, 245, 255, 0.35)";
        }}
      >
        <Plus size={14} />
        Add App
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          role="menu"
          className="fixed z-50 rounded-lg overflow-hidden animate-context-menu"
          style={{
            left:      Math.min(contextMenu.x, window.innerWidth  - 160),
            top:       Math.min(contextMenu.y, window.innerHeight - 120),
            minWidth:  "150px",
            background:     "rgba(4, 4, 18, 0.95)",
            backdropFilter: "blur(20px)",
            border:         "1px solid rgba(0, 245, 255, 0.25)",
            boxShadow:      "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,245,255,0.08)",
          }}
        >
          <div
            className="px-3 py-2 border-b font-orbitron"
            style={{
              borderColor:   "rgba(0,245,255,0.1)",
              fontSize:      "9px",
              letterSpacing: "0.15em",
              color:         "rgba(0,245,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            {contextMenu.app.emoji} {contextMenu.app.name}
          </div>
          {[
            { label: "Open",   action: () => { onAppLaunch(contextMenu.app); closeContextMenu(); }, color: "#00f5ff" },
            { label: "Edit",   action: () => { onAppEdit(contextMenu.app);   closeContextMenu(); }, color: "#bf00ff" },
            { label: "Delete", action: () => { onAppDelete(contextMenu.app.id); closeContextMenu(); }, color: "#ff4444" },
          ].map((item) => (
            <button
              type="button"
              role="menuitem"
              key={item.label}
              onClick={item.action}
              className="context-menu-item w-full text-left px-4 py-2.5 font-rajdhani"
              style={{
                fontSize:   "13px",
                fontWeight: 600,
                color:      "rgba(220, 235, 255, 0.85)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = `${item.color}18`;
                el.style.color      = item.color;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "transparent";
                el.style.color      = "rgba(220, 235, 255, 0.85)";
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
