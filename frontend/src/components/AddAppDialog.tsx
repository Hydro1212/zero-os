import React, { useState } from "react";
import { toast } from "sonner";
import { useAddApp } from "../hooks/useQueries";

interface AddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function normalizeUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return "https://" + url;
}

export default function AddAppDialog({ open, onOpenChange }: AddAppDialogProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const addApp = useAddApp();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = normalizeUrl(url.trim());

    if (!trimmedName || !trimmedUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      await addApp.mutateAsync({ id, name: trimmedName, url: trimmedUrl });
      toast.success(`${trimmedName} installed!`);
      setName("");
      setUrl("");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add app";
      toast.error(msg);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-[400px] rounded-xl border border-neon-cyan/30 p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,20,30,0.98) 100%)",
          boxShadow:
            "0 0 40px rgba(0,255,255,0.15), 0 0 80px rgba(0,255,255,0.05)",
        }}
      >
        <h2 className="font-orbitron text-sm text-neon-cyan tracking-widest uppercase mb-5">
          Install App
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-neon-cyan/60 mb-1 uppercase tracking-widest">
              App Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
              className="w-full bg-black/40 border border-neon-cyan/30 rounded px-3 py-2 text-sm font-mono text-neon-cyan placeholder-neon-cyan/20 focus:outline-none focus:border-neon-cyan/60"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-neon-cyan/60 mb-1 uppercase tracking-widest">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-black/40 border border-neon-cyan/30 rounded px-3 py-2 text-sm font-mono text-neon-cyan placeholder-neon-cyan/20 focus:outline-none focus:border-neon-cyan/60"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2 rounded border border-neon-cyan/20 text-neon-cyan/50 text-xs font-mono hover:border-neon-cyan/40 hover:text-neon-cyan/70 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addApp.isPending}
              className="flex-1 py-2 rounded border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan text-xs font-mono hover:bg-neon-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addApp.isPending ? "Installing..." : "Install"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
