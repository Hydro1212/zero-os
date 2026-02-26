import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface App {
    id: string;
    url: string;
    order: bigint;
    name: string;
    color: string;
    emoji: string;
}
export interface Settings {
    backgroundEffect: string;
    wallpaper: string;
    accentColor: string;
    showClock: boolean;
    openInIframe: boolean;
    taskbarPosition: string;
}
export interface backendInterface {
    addApp(app: App): Promise<void>;
    deleteApp(appId: string): Promise<void>;
    getApps(): Promise<Array<App>>;
    getSettings(): Promise<Settings>;
    updateApp(app: App): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
}
