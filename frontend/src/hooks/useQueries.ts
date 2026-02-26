import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Settings } from "../backend";
import {
  AccentColor,
  ClockFormat,
  FontSize,
  ParticleIntensity,
  ScanlineEffect,
  TaskbarHeight,
  UITransparency,
  WindowBorderGlow,
} from "../backend";

export const DEFAULT_SETTINGS: Settings = {
  accentColor: AccentColor.cyan,
  wallpaperUrl: "",
  desktopLabel: "My DFINITY Desktop",
  fontSize: FontSize.medium,
  uiTransparency: UITransparency.medium,
  clockFormat: ClockFormat.hour24,
  taskbarHeight: TaskbarHeight.normal,
  iconSize: "medium" as Settings["iconSize"],
  particleIntensity: ParticleIntensity.medium,
  scanlineEffect: ScanlineEffect.on,
  gridOverlay: "on" as Settings["gridOverlay"],
  windowBorderGlow: WindowBorderGlow.subtle,
};

export interface AppData {
  id: string;
  name: string;
  url: string;
}

const APPS_STORAGE_KEY = "zero_os_apps";

function loadAppsFromStorage(): AppData[] {
  try {
    const stored = localStorage.getItem(APPS_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AppData[];
  } catch {
    // ignore
  }
  return [];
}

function saveAppsToStorage(apps: AppData[]) {
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
}

export function useGetApps() {
  return useQuery<AppData[]>({
    queryKey: ["apps"],
    queryFn: () => loadAppsFromStorage(),
    staleTime: Infinity,
  });
}

export function useAddApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (app: AppData) => {
      // Persist to backend if available
      if (actor) {
        try {
          await actor.addApp(app.id, app.name, app.url);
        } catch {
          // backend may reject duplicates; continue with localStorage
        }
      }
      const current = loadAppsFromStorage();
      if (current.find((a) => a.id === app.id)) {
        throw new Error("App already exists");
      }
      const updated = [...current, app];
      saveAppsToStorage(updated);
      return app;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useRemoveApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      const current = loadAppsFromStorage();
      const updated = current.filter((a) => a.id !== appId);
      saveAppsToStorage(updated);
      return appId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => {
      if (!actor) return DEFAULT_SETTINGS;
      try {
        return await actor.getSettings();
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSaveSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: Settings) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.saveSettings(newSettings);
      return newSettings;
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(["settings"], newSettings);
    },
  });
}

// Video wallpaper: create a local object URL from the file.
// The URL is valid for the current browser session.
export function useUploadWallpaperVideo() {
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (pct: number) => void;
    }): Promise<string> => {
      // Simulate progress for UX
      if (onProgress) {
        onProgress(10);
        await new Promise((r) => setTimeout(r, 100));
        onProgress(50);
        await new Promise((r) => setTimeout(r, 100));
        onProgress(90);
        await new Promise((r) => setTimeout(r, 100));
        onProgress(100);
      }
      // Create a persistent object URL for this session
      const objectUrl = URL.createObjectURL(file);
      return objectUrl;
    },
  });
}
