import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import Wallpaper from "./Wallpaper";
import Taskbar from "./Taskbar";
import AppIcon from "./AppIcon";
import Window from "./Window";
import AddAppDialog from "./AddAppDialog";
import SettingsPanel from "./SettingsPanel";
import ParticleEffect from "./ParticleEffect";
import { useGetApps, useRemoveApp } from "../hooks/useQueries";
import { useSettings } from "../hooks/useSettings";
import {
  ParticleIntensity,
  WindowBorderGlow,
  UITransparency,
} from "../backend";
import type { Settings } from "../backend";

type ParticleIntensityValue = Settings["particleIntensity"];
type WindowBorderGlowValue = Settings["windowBorderGlow"];
type UITransparencyValue = Settings["uiTransparency"];

interface OpenWindow {
  appId: string;
  appName: string;
  appUrl: string;
  minimized: boolean;
  zIndex: number;
}

const BUILT_IN_APPS = [
  {
    id: "settings",
    name: "Settings",
    url: "internal://settings",
    isBuiltIn: true,
  },
];

function getTaskbarHeightPx(height: Settings["taskbarHeight"] | undefined): number {
  if (!height) return 56;
  const h = height as string;
  if (h === "compact") return 44;
  if (h === "tall") return 72;
  return 56;
}

export default function Desktop() {
  const { data: settings } = useSettings();
  const { data: userApps = [] } = useGetApps();
  const removeAppMutation = useRemoveApp();

  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [addAppOpen, setAddAppOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const allApps = [
    ...BUILT_IN_APPS,
    ...userApps.map((a) => ({ ...a, isBuiltIn: false })),
  ];

  const wallpaperUrl = settings?.wallpaperUrl ?? "";
  const desktopLabel = settings?.desktopLabel ?? "My DFINITY Desktop";
  const taskbarHeightPx = getTaskbarHeightPx(settings?.taskbarHeight);

  const scanlineOn = !settings || (settings.scanlineEffect as string) === "on";
  const gridOn = !settings || (settings.gridOverlay as string) === "on";

  const particleIntensity = (settings?.particleIntensity ?? ParticleIntensity.medium) as ParticleIntensityValue;
  const windowBorderGlow = (settings?.windowBorderGlow ?? WindowBorderGlow.subtle) as WindowBorderGlowValue;
  const uiTransparency = (settings?.uiTransparency ?? UITransparency.medium) as UITransparencyValue;

  const iconSizeStr = (settings?.iconSize as string | undefined) ?? "medium";
  const fontSizeStr = (settings?.fontSize as string | undefined) ?? "medium";

  const openApp = useCallback(
    (appId: string, appName: string, appUrl: string) => {
      if (appUrl === "internal://settings") {
        setSettingsOpen(true);
        return;
      }
      const existing = openWindows.find((w) => w.appId === appId);
      if (existing) {
        const newZ = topZ + 1;
        setTopZ(newZ);
        setOpenWindows((prev) =>
          prev.map((w) =>
            w.appId === appId ? { ...w, minimized: false, zIndex: newZ } : w
          )
        );
        return;
      }
      const newZ = topZ + 1;
      setTopZ(newZ);
      setOpenWindows((prev) => [
        ...prev,
        { appId, appName, appUrl, minimized: false, zIndex: newZ },
      ]);
    },
    [openWindows, topZ]
  );

  const closeWindow = useCallback((appId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.appId !== appId));
  }, []);

  const minimizeWindow = useCallback((appId: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, minimized: true } : w))
    );
  }, []);

  const focusWindow = useCallback(
    (appId: string) => {
      const newZ = topZ + 1;
      setTopZ(newZ);
      setOpenWindows((prev) =>
        prev.map((w) =>
          w.appId === appId ? { ...w, minimized: false, zIndex: newZ } : w
        )
      );
    },
    [topZ]
  );

  const handleRemoveApp = useCallback(
    async (appId: string) => {
      try {
        await removeAppMutation.mutateAsync(appId);
        closeWindow(appId);
        toast.success("App removed");
      } catch {
        toast.error("Failed to remove app");
      }
    },
    [removeAppMutation, closeWindow]
  );

  const taskbarApps = openWindows.map((w) => ({
    id: w.appId,
    name: w.appName,
    minimized: w.minimized,
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Share Tech Mono, monospace",
      }}
    >
      {/* Wallpaper */}
      <Wallpaper url={wallpaperUrl} />

      {/* Particles */}
      <ParticleEffect intensity={particleIntensity} />

      {/* Scanline overlay */}
      {scanlineOn && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0 0 0 / 0.06) 2px, oklch(0 0 0 / 0.06) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
      )}

      {/* Grid overlay */}
      {gridOn && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            pointerEvents: "none",
            backgroundImage: `
              linear-gradient(oklch(0.85 0.2 195 / 0.04) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.85 0.2 195 / 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      {/* Desktop content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: `calc(100vh - ${taskbarHeightPx}px)`,
          padding: "20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Desktop label */}
        {desktopLabel && (
          <div
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "11px",
              color: "oklch(0.85 0.2 195 / 0.5)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              textShadow: "0 0 10px oklch(0.85 0.2 195 / 0.3)",
            }}
          >
            {desktopLabel}
          </div>
        )}

        {/* App icons grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignContent: "flex-start",
          }}
        >
          {allApps.map((app) => (
            <AppIcon
              key={app.id}
              id={app.id}
              name={app.name}
              url={app.url}
              isOpen={openWindows.some(
                (w) => w.appId === app.id && !w.minimized
              )}
              isMinimized={
                openWindows.find((w) => w.appId === app.id)?.minimized ?? false
              }
              onOpen={() => openApp(app.id, app.name, app.url)}
              onRemove={
                !app.isBuiltIn ? () => handleRemoveApp(app.id) : undefined
              }
              iconSize={iconSizeStr as "small" | "medium" | "large"}
              fontSize={fontSizeStr as "small" | "medium" | "large"}
            />
          ))}
        </div>
      </div>

      {/* Open Windows */}
      {openWindows.map((w) => (
        <Window
          key={w.appId}
          id={w.appId}
          title={w.appName}
          url={w.appUrl}
          isMinimized={w.minimized}
          zIndex={w.zIndex}
          onClose={() => closeWindow(w.appId)}
          onMinimize={() => minimizeWindow(w.appId)}
          onFocus={() => focusWindow(w.appId)}
          windowBorderGlow={windowBorderGlow}
          uiTransparency={uiTransparency}
        />
      ))}

      {/* Settings Window */}
      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "oklch(0 0 0 / 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div
            style={{
              width: "800px",
              maxWidth: "95vw",
              height: "600px",
              maxHeight: "90vh",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid oklch(0.85 0.2 195 / 0.3)",
              boxShadow:
                "0 0 40px oklch(0.85 0.2 195 / 0.15), 0 0 80px oklch(0.85 0.2 195 / 0.05)",
              background:
                "linear-gradient(135deg, oklch(0.07 0.02 240) 0%, oklch(0.05 0.015 240) 100%)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                height: "44px",
                borderBottom: "1px solid oklch(0.85 0.2 195 / 0.2)",
                background: "oklch(0.1 0.03 240 / 0.8)",
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "oklch(0.85 0.2 195)",
                    boxShadow: "0 0 8px oklch(0.85 0.2 195)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Orbitron, monospace",
                    fontSize: "12px",
                    color: "oklch(0.85 0.2 195)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Settings
                </span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  border: "1px solid oklch(0.65 0.25 25 / 0.5)",
                  background: "oklch(0.65 0.25 25 / 0.15)",
                  color: "oklch(0.75 0.25 25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            {/* Settings content */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SettingsPanel onClose={() => setSettingsOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        apps={taskbarApps}
        onAppClick={(id) => focusWindow(id)}
        onAddApp={() => setAddAppOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        taskbarHeight={(settings?.taskbarHeight as string | undefined) as "compact" | "normal" | "tall" | undefined}
        accentColor={(settings?.accentColor as string | undefined) as "cyan" | "magenta" | "green" | undefined}
        clockFormat={(settings?.clockFormat as string | undefined) as "hour12" | "hour24" | undefined}
      />

      {/* Add App Dialog */}
      <AddAppDialog open={addAppOpen} onOpenChange={setAddAppOpen} />
    </div>
  );
}
