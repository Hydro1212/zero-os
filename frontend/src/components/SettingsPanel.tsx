import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useGetSettings,
  useSaveSettings,
  useUploadWallpaperVideo,
} from "../hooks/useQueries";
import type { Settings } from "../backend";
import {
  AccentColor,
  FontSize,
  UITransparency,
  ClockFormat,
  TaskbarHeight,
  ParticleIntensity,
  ScanlineEffect,
  WindowBorderGlow,
} from "../backend";
import PinDialog from "./PinDialog";
import { Progress } from "@/components/ui/progress";

interface SettingsPanelProps {
  onClose?: () => void;
}

type Section =
  | "appearance"
  | "wallpaper"
  | "desktop"
  | "taskbar"
  | "effects"
  | "clock"
  | "apps";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "wallpaper", label: "Wallpaper", icon: "🖼️" },
  { id: "desktop", label: "Desktop", icon: "🖥️" },
  { id: "taskbar", label: "Taskbar", icon: "📌" },
  { id: "effects", label: "Effects", icon: "✨" },
  { id: "clock", label: "Clock", icon: "🕐" },
  { id: "apps", label: "Apps", icon: "📦" },
];

const CORRECT_PIN = "2011";

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { data: settings, isLoading } = useGetSettings();
  const saveSettings = useSaveSettings();
  const uploadVideo = useUploadWallpaperVideo();

  const [activeSection, setActiveSection] = useState<Section>("appearance");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pendingWallpaperUrl, setPendingWallpaperUrl] = useState<string | null>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [wallpaperInput, setWallpaperInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [local, setLocal] = useState<Settings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state from server once
  React.useEffect(() => {
    if (settings && !local) {
      setLocal(settings as Settings);
      setWallpaperInput((settings as Settings).wallpaperUrl ?? "");
    }
  }, [settings, local]);

  if (isLoading || !local) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "oklch(0.85 0.2 195)",
          fontFamily: "Orbitron, monospace",
          fontSize: "12px",
        }}
      >
        LOADING SETTINGS...
      </div>
    );
  }

  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    if (!local) return;
    const updated: Settings = { ...local, [key]: value };
    setLocal(updated);
    try {
      await saveSettings.mutateAsync(updated);
      toast.success("Setting saved");
    } catch {
      toast.error("Failed to save setting");
    }
  }

  function requestWallpaperChange(url: string) {
    setPendingWallpaperUrl(url);
    setPendingVideoFile(null);
    setPinError("");
    setPinDialogOpen(true);
  }

  function requestVideoWallpaperChange(file: File) {
    setPendingVideoFile(file);
    setPendingWallpaperUrl(null);
    setPinError("");
    setPinDialogOpen(true);
  }

  async function handlePinSubmit(pin: string) {
    if (pin !== CORRECT_PIN) {
      setPinError("INCORRECT PIN — ACCESS DENIED");
      return;
    }
    setPinDialogOpen(false);
    setPinError("");

    if (pendingVideoFile) {
      const file = pendingVideoFile;
      setPendingVideoFile(null);
      setUploadProgress(0);
      try {
        const url = await uploadVideo.mutateAsync({
          file,
          onProgress: (pct) => setUploadProgress(pct),
        });
        await updateSetting("wallpaperUrl", url);
        setUploadProgress(null);
        toast.success("Video wallpaper set!");
      } catch {
        setUploadProgress(null);
        toast.error("Failed to set video wallpaper");
      }
    } else if (pendingWallpaperUrl !== null) {
      const url = pendingWallpaperUrl;
      setPendingWallpaperUrl(null);
      await updateSetting("wallpaperUrl", url);
    }
  }

  function handlePinCancel() {
    setPinDialogOpen(false);
    setPinError("");
    setPendingWallpaperUrl(null);
    setPendingVideoFile(null);
  }

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("mp4") && !file.name.toLowerCase().endsWith(".mp4")) {
      toast.error("Please select an MP4 file");
      return;
    }
    requestVideoWallpaperChange(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const accentKey = local.accentColor as string;
  const fontSizeKey = local.fontSize as string;
  const transparencyKey = local.uiTransparency as string;
  const clockFormatKey = local.clockFormat as string;
  const taskbarHeightKey = local.taskbarHeight as string;
  const iconSizeKey = local.iconSize as string;
  const particleKey = local.particleIntensity as string;
  const scanlineKey = local.scanlineEffect as string;
  const gridKey = local.gridOverlay as string;
  const glowKey = local.windowBorderGlow as string;

  const neonBtn = (active: boolean) =>
    [
      "px-3 py-1.5 rounded text-xs font-mono transition-all border cursor-pointer",
      active
        ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
        : "border-neon-cyan/20 text-neon-cyan/50 hover:border-neon-cyan/50 hover:text-neon-cyan/80",
    ].join(" ");

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    fontFamily: "Share Tech Mono, monospace",
    color: "oklch(0.85 0.2 195 / 0.6)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "Orbitron, monospace",
    fontSize: "11px",
    color: "oklch(0.85 0.2 195)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid oklch(0.85 0.2 195 / 0.2)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "oklch(0.08 0.02 240 / 0.8)",
    border: "1px solid oklch(0.85 0.2 195 / 0.3)",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "12px",
    fontFamily: "Share Tech Mono, monospace",
    color: "oklch(0.9 0.1 195)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "160px",
          flexShrink: 0,
          borderRight: "1px solid oklch(0.85 0.2 195 / 0.15)",
          background: "oklch(0.07 0.02 240 / 0.5)",
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "none",
              background:
                activeSection === s.id
                  ? "oklch(0.85 0.2 195 / 0.15)"
                  : "transparent",
              color:
                activeSection === s.id
                  ? "oklch(0.85 0.2 195)"
                  : "oklch(0.6 0.05 240)",
              boxShadow:
                activeSection === s.id
                  ? "0 0 8px oklch(0.85 0.2 195 / 0.2), inset 0 0 0 1px oklch(0.85 0.2 195 / 0.2)"
                  : "none",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "11px",
              letterSpacing: "0.05em",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* APPEARANCE */}
        {activeSection === "appearance" && (
          <>
            <div style={sectionTitleStyle}>Appearance</div>

            <div>
              <div style={labelStyle}>Accent Color</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {(
                  [
                    AccentColor.cyan,
                    AccentColor.magenta,
                    AccentColor.green,
                  ] as string[]
                ).map((color) => {
                  const colorMap: Record<string, string> = {
                    cyan: "oklch(0.85 0.2 195)",
                    magenta: "oklch(0.75 0.25 320)",
                    green: "oklch(0.8 0.2 145)",
                  };
                  return (
                    <button
                      key={color}
                      onClick={() =>
                        updateSetting(
                          "accentColor",
                          color as Settings["accentColor"]
                        )
                      }
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: colorMap[color],
                        border:
                          accentKey === color
                            ? "3px solid oklch(0.95 0.05 195)"
                            : "3px solid transparent",
                        boxShadow:
                          accentKey === color
                            ? `0 0 12px ${colorMap[color]}`
                            : "none",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Font Size</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [FontSize.small, FontSize.medium, FontSize.large] as string[]
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      updateSetting("fontSize", f as Settings["fontSize"])
                    }
                    className={neonBtn(fontSizeKey === f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Window Transparency</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(
                  [
                    UITransparency.none,
                    UITransparency.low,
                    UITransparency.medium,
                    UITransparency.high,
                  ] as string[]
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      updateSetting(
                        "uiTransparency",
                        t as Settings["uiTransparency"]
                      )
                    }
                    className={neonBtn(transparencyKey === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Window Border Glow</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [
                    WindowBorderGlow.none,
                    WindowBorderGlow.subtle,
                    WindowBorderGlow.intense,
                  ] as string[]
                ).map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      updateSetting(
                        "windowBorderGlow",
                        g as Settings["windowBorderGlow"]
                      )
                    }
                    className={neonBtn(glowKey === g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Icon Size</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updateSetting(
                        "iconSize",
                        s as Settings["iconSize"]
                      )
                    }
                    className={neonBtn(iconSizeKey === s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* WALLPAPER */}
        {activeSection === "wallpaper" && (
          <>
            <div style={sectionTitleStyle}>Wallpaper</div>

            {/* Current wallpaper preview */}
            {local.wallpaperUrl && (
              <div>
                <div style={labelStyle}>Current Wallpaper</div>
                <div
                  style={{
                    width: "100%",
                    height: "100px",
                    borderRadius: "6px",
                    border: "1px solid oklch(0.85 0.2 195 / 0.2)",
                    overflow: "hidden",
                    background: "oklch(0.05 0.01 240)",
                  }}
                >
                  {local.wallpaperUrl.startsWith("blob:") ? (
                    <video
                      src={local.wallpaperUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : local.wallpaperUrl.endsWith(".mp4") ? (
                    <video
                      src={local.wallpaperUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={local.wallpaperUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      alt="wallpaper preview"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Upload MP4 */}
            <div
              style={{
                padding: "14px",
                borderRadius: "6px",
                border: "1px solid oklch(0.85 0.2 195 / 0.2)",
                background: "oklch(0.85 0.2 195 / 0.03)",
              }}
            >
              <div style={labelStyle}>Upload MP4 Video Wallpaper</div>
              <p
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "10px",
                  color: "oklch(0.85 0.2 195 / 0.4)",
                  marginBottom: "10px",
                }}
              >
                Upload a local MP4 file to use as an animated wallpaper with
                audio. PIN protected.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,video/mp4"
                onChange={handleVideoFileChange}
                style={{ display: "none" }}
                id="mp4-upload"
              />
              <label
                htmlFor="mp4-upload"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid oklch(0.85 0.2 195 / 0.4)",
                  background: "oklch(0.85 0.2 195 / 0.08)",
                  color: "oklch(0.85 0.2 195)",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "11px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.1em",
                }}
              >
                📁 Choose MP4 File
              </label>

              {uploadProgress !== null && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: "10px",
                      color: "oklch(0.85 0.2 195 / 0.6)",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>

            {/* URL input */}
            <div>
              <div style={labelStyle}>Wallpaper URL (Image or .mp4 Video)</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={wallpaperInput}
                  onChange={(e) => setWallpaperInput(e.target.value)}
                  placeholder="https://example.com/wallpaper.jpg"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => {
                    if (wallpaperInput.trim()) {
                      requestWallpaperChange(wallpaperInput.trim());
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: "1px solid oklch(0.75 0.25 320 / 0.5)",
                    background: "oklch(0.75 0.25 320 / 0.1)",
                    color: "oklch(0.75 0.25 320)",
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔒 Apply
                </button>
              </div>
              <p
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "oklch(0.85 0.2 195 / 0.3)",
                  marginTop: "4px",
                }}
              >
                PIN: 2011 required to change wallpaper
              </p>
            </div>

            {/* Preset: Default */}
            <div>
              <div style={labelStyle}>Presets</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() =>
                    requestWallpaperChange(
                      "/assets/generated/wallpaper.dim_1920x1080.png"
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid oklch(0.85 0.2 195 / 0.3)",
                    background: "oklch(0.85 0.2 195 / 0.05)",
                    color: "oklch(0.85 0.2 195 / 0.7)",
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Default Wallpaper
                </button>
                {local.wallpaperUrl && (
                  <button
                    onClick={() => requestWallpaperChange("")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid oklch(0.65 0.25 25 / 0.4)",
                      background: "oklch(0.65 0.25 25 / 0.08)",
                      color: "oklch(0.65 0.25 25)",
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Clear Wallpaper
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* DESKTOP */}
        {activeSection === "desktop" && (
          <>
            <div style={sectionTitleStyle}>Desktop</div>

            <div>
              <div style={labelStyle}>Desktop Label</div>
              <input
                type="text"
                defaultValue={local.desktopLabel}
                onBlur={(e) => {
                  if (e.target.value !== local.desktopLabel) {
                    updateSetting("desktopLabel", e.target.value);
                  }
                }}
                style={inputStyle}
                placeholder="My Desktop"
              />
            </div>

            <div>
              <div style={labelStyle}>Grid Overlay</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["on", "off"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      updateSetting(
                        "gridOverlay",
                        v as Settings["gridOverlay"]
                      )
                    }
                    className={neonBtn(gridKey === v)}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Scanline Effect</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [ScanlineEffect.on, ScanlineEffect.off] as string[]
                ).map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      updateSetting(
                        "scanlineEffect",
                        v as Settings["scanlineEffect"]
                      )
                    }
                    className={neonBtn(scanlineKey === v)}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TASKBAR */}
        {activeSection === "taskbar" && (
          <>
            <div style={sectionTitleStyle}>Taskbar</div>

            <div>
              <div style={labelStyle}>Taskbar Height</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [
                    TaskbarHeight.compact,
                    TaskbarHeight.normal,
                    TaskbarHeight.tall,
                  ] as string[]
                ).map((h) => (
                  <button
                    key={h}
                    onClick={() =>
                      updateSetting(
                        "taskbarHeight",
                        h as Settings["taskbarHeight"]
                      )
                    }
                    className={neonBtn(taskbarHeightKey === h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "oklch(0.85 0.2 195 / 0.3)",
                  marginTop: "6px",
                }}
              >
                Compact: 44px · Normal: 56px · Tall: 72px
              </p>
            </div>
          </>
        )}

        {/* EFFECTS */}
        {activeSection === "effects" && (
          <>
            <div style={sectionTitleStyle}>Effects</div>

            <div>
              <div style={labelStyle}>Particle Intensity</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(
                  [
                    ParticleIntensity.off,
                    ParticleIntensity.low,
                    ParticleIntensity.medium,
                    ParticleIntensity.high,
                  ] as string[]
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      updateSetting(
                        "particleIntensity",
                        p as Settings["particleIntensity"]
                      )
                    }
                    className={neonBtn(particleKey === p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Window Border Glow</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [
                    WindowBorderGlow.none,
                    WindowBorderGlow.subtle,
                    WindowBorderGlow.intense,
                  ] as string[]
                ).map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      updateSetting(
                        "windowBorderGlow",
                        g as Settings["windowBorderGlow"]
                      )
                    }
                    className={neonBtn(glowKey === g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CLOCK */}
        {activeSection === "clock" && (
          <>
            <div style={sectionTitleStyle}>Clock</div>

            <div>
              <div style={labelStyle}>Clock Format</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(
                  [ClockFormat.hour12, ClockFormat.hour24] as string[]
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      updateSetting(
                        "clockFormat",
                        f as Settings["clockFormat"]
                      )
                    }
                    className={neonBtn(clockFormatKey === f)}
                  >
                    {f === "hour12" ? "12-hour" : "24-hour"}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: "6px",
                background: "oklch(0.85 0.2 195 / 0.05)",
                border: "1px solid oklch(0.85 0.2 195 / 0.15)",
              }}
            >
              <span
                style={{
                  fontFamily: "Orbitron, monospace",
                  fontSize: "18px",
                  color: "oklch(0.9 0.15 195)",
                  letterSpacing: "0.1em",
                }}
              >
                {clockFormatKey === "hour12"
                  ? new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                  : new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
              </span>
              <p
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "oklch(0.85 0.2 195 / 0.4)",
                  marginTop: "4px",
                }}
              >
                Preview of current format
              </p>
            </div>
          </>
        )}

        {/* APPS */}
        {activeSection === "apps" && (
          <>
            <div style={sectionTitleStyle}>Apps</div>
            <p
              style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "11px",
                color: "oklch(0.85 0.2 195 / 0.4)",
                lineHeight: 1.6,
              }}
            >
              Apps are managed from the desktop. Right-click any app icon to
              remove it, or use the + button in the taskbar to install new apps.
            </p>
            <div
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid oklch(0.85 0.2 195 / 0.15)",
                background: "oklch(0.85 0.2 195 / 0.03)",
              }}
            >
              <div
                style={{
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "9px",
                  color: "oklch(0.85 0.2 195 / 0.4)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Built-in Apps
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 0",
                }}
              >
                <span>⚙️</span>
                <span
                  style={{
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                    color: "oklch(0.85 0.2 195 / 0.8)",
                  }}
                >
                  Settings
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "9px",
                    color: "oklch(0.85 0.2 195 / 0.3)",
                  }}
                >
                  system
                </span>
              </div>
            </div>
          </>
        )}

        {/* Save indicator */}
        {saveSettings.isPending && (
          <div
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "9px",
              color: "oklch(0.85 0.2 195)",
              letterSpacing: "0.1em",
              textAlign: "right",
            }}
          >
            SAVING...
          </div>
        )}
      </div>

      {/* PIN Dialog */}
      {pinDialogOpen && (
        <PinDialog
          onSubmit={handlePinSubmit}
          onCancel={handlePinCancel}
          error={pinError}
        />
      )}
    </div>
  );
}
