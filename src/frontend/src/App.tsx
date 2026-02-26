import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import type { App as AppData, Settings } from "./backend.d";

import { DesktopBackground } from "./components/DesktopBackground";
import { Taskbar } from "./components/Taskbar";
import { DesktopIcons } from "./components/DesktopIcons";
import { StartMenu } from "./components/StartMenu";
import { AppWindow } from "./components/AppWindow";
import { AppModal } from "./components/AppModal";
import { SettingsWindow } from "./components/SettingsWindow";

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_APPS: Omit<AppData, "id" | "order">[] = [
  { name: "YouTube",  url: "https://youtube.com", emoji: "▶️", color: "#ff0040" },
  { name: "GitHub",   url: "https://github.com",  emoji: "🐙", color: "#bf00ff" },
  { name: "Google",   url: "https://google.com",  emoji: "🔍", color: "#00f5ff" },
  { name: "Twitter/X",url: "https://x.com",       emoji: "𝕏",  color: "#00acee" },
  { name: "Reddit",   url: "https://reddit.com",  emoji: "👽", color: "#ff4500" },
];

interface OpenWindow {
  id: string;
  app: AppData;
  zIndex: number;
}

const DEFAULT_SETTINGS: Settings = {
  backgroundEffect: "grid",
  wallpaper: "#050510",
  accentColor: "#00f5ff",
  showClock: true,
  openInIframe: true,
  taskbarPosition: "bottom",
};

// ─── localStorage helpers ──────────────────────────────────────────────────────

// App stored in localStorage uses `order` as a number (BigInt doesn't serialize)
interface StoredApp extends Omit<AppData, "order"> {
  order: number;
}

const SEEDED_KEY = "zero-os-seeded";

function hasBeenSeeded(): boolean {
  return localStorage.getItem(SEEDED_KEY) === "true";
}

function markSeeded() {
  localStorage.setItem(SEEDED_KEY, "true");
}

function loadApps(): AppData[] {
  try {
    const raw = localStorage.getItem("zero-os-apps");
    if (!raw) return [];
    const stored: StoredApp[] = JSON.parse(raw);
    return stored.map((a) => ({ ...a, order: BigInt(a.order) }));
  } catch {
    return [];
  }
}

function saveApps(apps: AppData[]) {
  const stored: StoredApp[] = apps.map((a) => ({ ...a, order: Number(a.order) }));
  localStorage.setItem("zero-os-apps", JSON.stringify(stored));
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("zero-os-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem("zero-os-settings", JSON.stringify(s));
}

// ─── Boot-sequence typewriter ──────────────────────────────────────────────────

const BOOT_CHARS = "ZERO OS".split("");

function BootScreen({ onDone }: { onDone: () => void }) {
  const [chars, setChars] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setChars(i);
      if (i >= BOOT_CHARS.length) {
        clearInterval(iv);
        // Brief hold then exit
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 420);
        }, 320);
      }
    }, 70);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div className={`boot-screen${exiting ? " exiting" : ""}`}>
      <h1
        className="font-orbitron"
        style={{
          fontSize: "36px",
          letterSpacing: "0.25em",
          color: "#00f5ff",
          textShadow: "0 0 20px rgba(0,245,255,0.7), 0 0 50px rgba(0,245,255,0.3)",
        }}
      >
        {BOOT_CHARS.slice(0, chars).join("")}
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "1em",
            background: "#00f5ff",
            marginLeft: "3px",
            verticalAlign: "middle",
            animation: "cursor-blink 0.6s step-end infinite",
            boxShadow: "0 0 8px rgba(0,245,255,0.9)",
          }}
        />
      </h1>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  // ── Apps state (localStorage) ─────────────────────────────────────────────
  const [apps, setApps] = useState<AppData[]>(() => {
    const loaded = loadApps();
    if (!hasBeenSeeded()) {
      // First-ever launch: seed defaults and mark as seeded
      const seeded = DEFAULT_APPS.map((a, i): AppData => ({
        ...a,
        id: crypto.randomUUID(),
        order: BigInt(i),
      }));
      saveApps(seeded);
      markSeeded();
      return seeded;
    }
    // User has already been seeded — respect their saved state (even if empty)
    return loaded;
  });

  // ── Settings state (localStorage) ────────────────────────────────────────
  const [localSettings, setLocalSettings] = useState<Settings>(loadSettings);

  // ── Boot sequence on first mount ─────────────────────────────────────────
  const [showBoot, setShowBoot]         = useState(false);
  const [desktopReady, setDesktopReady] = useState(false);

  useEffect(() => {
    setShowBoot(true);
    setDesktopReady(false);
  }, []);

  const handleBootDone = useCallback(() => {
    setShowBoot(false);
    setDesktopReady(true);
  }, []);

  // ── Window management ──────────────────────────────────────────────────────
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [topZ, setTopZ] = useState(100);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [startOpen, setStartOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp]     = useState<AppData | null>(null);

  // ── App launch ─────────────────────────────────────────────────────────────
  const launchApp = useCallback((app: AppData) => {
    if (localSettings.openInIframe) {
      setOpenWindows((prev) => {
        if (prev.find((w) => w.app.id === app.id)) {
          const newZ = topZ + 1;
          setTopZ(newZ);
          return prev.map((w) => w.app.id === app.id ? { ...w, zIndex: newZ } : w);
        }
        const newZ = topZ + 1;
        setTopZ(newZ);
        return [...prev, { id: app.id + Date.now(), app, zIndex: newZ }];
      });
    } else {
      window.open(app.url, "_blank", "noopener,noreferrer");
    }
  }, [localSettings.openInIframe, topZ]);

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setTopZ((z) => {
      const newZ = z + 1;
      setOpenWindows((prev) => prev.map((w) => w.id === windowId ? { ...w, zIndex: newZ } : w));
      return newZ;
    });
  }, []);

  // ── App mutations (localStorage) ──────────────────────────────────────────
  const handleSaveApp = useCallback((app: AppData) => {
    try {
      if (editingApp) {
        setApps((prev) => {
          const next = prev.map((a) => a.id === app.id ? app : a);
          saveApps(next);
          return next;
        });
        setEditingApp(null);
        toast.success(`${app.emoji} ${app.name} updated`);
      } else {
        setApps((prev) => {
          const next = [...prev, app];
          saveApps(next);
          return next;
        });
        toast.success(`${app.emoji} ${app.name} added`);
      }
      setAppModalOpen(false);
    } catch {
      toast.error("Failed to save app");
    }
  }, [editingApp]);

  const handleDeleteApp = useCallback((appId: string) => {
    const app = apps.find((a) => a.id === appId);
    try {
      setApps((prev) => {
        const next = prev.filter((a) => a.id !== appId);
        saveApps(next);
        return next;
      });
      toast.success(`${app?.name ?? "App"} deleted`);
    } catch {
      toast.error("Failed to delete app");
    }
  }, [apps]);

  const handleReorder = useCallback((reordered: AppData[]) => {
    setApps(() => {
      saveApps(reordered);
      return reordered;
    });
  }, []);

  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setLocalSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleEditApp = useCallback((app: AppData) => {
    setEditingApp(app);
    setAppModalOpen(true);
    setSettingsOpen(false);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Boot overlay on first mount ── */}
      {showBoot && <BootScreen onDone={handleBootDone} />}

      {/* ── Desktop ── */}
      <div
        className={`fixed inset-0 overflow-hidden${desktopReady ? " animate-desktop-in" : ""}`}
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          opacity: desktopReady ? undefined : 0,
        }}
      >
        <DesktopBackground settings={localSettings} />

        <DesktopIcons
          apps={apps}
          settings={localSettings}
          onAppLaunch={launchApp}
          onAppEdit={handleEditApp}
          onAppDelete={handleDeleteApp}
          onAddApp={() => { setEditingApp(null); setAppModalOpen(true); }}
          onReorder={handleReorder}
          desktopReady={desktopReady}
        />

        {/* App Windows */}
        {openWindows.map((w) => (
          <AppWindow
            key={w.id}
            app={w.app}
            zIndex={w.zIndex}
            onClose={() => closeWindow(w.id)}
            onFocus={() => focusWindow(w.id)}
            taskbarPosition={localSettings.taskbarPosition}
          />
        ))}

        {/* Settings Window */}
        {settingsOpen && (
          <SettingsWindow
            settings={localSettings}
            apps={apps}
            onClose={() => setSettingsOpen(false)}
            onSettingsChange={handleSettingsChange}
            onAppEdit={handleEditApp}
            onAppDelete={handleDeleteApp}
            zIndex={topZ + 10}
            onFocus={() => {}}
          />
        )}

        {/* Taskbar */}
        <Taskbar
          apps={apps}
          settings={localSettings}
          onStartClick={() => setStartOpen((v) => !v)}
          onSettingsClick={() => setSettingsOpen((v) => !v)}
          onAppLaunch={launchApp}
          startOpen={startOpen}
          desktopReady={desktopReady}
        />

        {/* Start Menu */}
        {startOpen && (
          <StartMenu
            apps={apps}
            settings={localSettings}
            onClose={() => setStartOpen(false)}
            onAppLaunch={launchApp}
            onAddApp={() => { setEditingApp(null); setAppModalOpen(true); }}
          />
        )}

        {/* Add/Edit App Modal */}
        {appModalOpen && (
          <AppModal
            app={editingApp}
            onSave={handleSaveApp}
            onClose={() => { setAppModalOpen(false); setEditingApp(null); }}
            existingAppsCount={apps.length}
          />
        )}

        {/* Footer */}
        <div
          className="fixed z-30 font-share-tech"
          style={{
            bottom: localSettings.taskbarPosition === "bottom" ? "58px" : "8px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "9px",
            letterSpacing: "0.1em",
            color: "rgba(0,245,255,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          © 2026. Built with{" "}
          <span style={{ color: "rgba(255,0,160,0.4)" }}>♥</span>{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(0,245,255,0.35)", textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#00f5ff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,245,255,0.35)"; }}
          >
            caffeine.ai
          </a>
        </div>

        <Toaster />
      </div>
    </>
  );
}
