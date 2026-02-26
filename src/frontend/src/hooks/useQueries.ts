import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { App, Settings } from "../backend.d";

// ─── Apps ─────────────────────────────────────────────────────────────────────

export function useGetApps() {
  const { actor, isFetching } = useActor();
  return useQuery<App[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApps();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (app: App) => {
      if (!actor) throw new Error("No actor");
      await actor.addApp(app);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useUpdateApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (app: App) => {
      if (!actor) throw new Error("No actor");
      await actor.updateApp(app);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useDeleteApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteApp(appId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  backgroundEffect: "grid",
  wallpaper: "#050510",
  accentColor: "#00f5ff",
  showClock: true,
  openInIframe: true,
  taskbarPosition: "bottom",
};

export function useGetSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SETTINGS;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_SETTINGS,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error("No actor");
      await actor.updateSettings(settings);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
