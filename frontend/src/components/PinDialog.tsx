import { useState, useRef, useEffect } from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';

interface PinDialogProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  error?: string;
}

export default function PinDialog({ onSubmit, onCancel, error }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onSubmit(pin.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999, background: 'oklch(0 0 0 / 0.75)' }}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />

      <div
        className="relative flex flex-col gap-5 p-6 w-80"
        style={{
          background: 'oklch(0.08 0.015 260)',
          border: '1px solid oklch(0.7 0.22 320 / 0.7)',
          boxShadow: '0 0 40px oklch(0.7 0.22 320 / 0.3), 0 0 80px oklch(0.7 0.22 320 / 0.1), inset 0 0 20px oklch(0.7 0.22 320 / 0.03)',
          borderRadius: '2px',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: '2px solid oklch(0.7 0.22 320 / 0.9)', borderLeft: '2px solid oklch(0.7 0.22 320 / 0.9)' }} />
        <div className="absolute top-0 right-0 w-4 h-4" style={{ borderTop: '2px solid oklch(0.7 0.22 320 / 0.9)', borderRight: '2px solid oklch(0.7 0.22 320 / 0.9)' }} />
        <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: '2px solid oklch(0.7 0.22 320 / 0.9)', borderLeft: '2px solid oklch(0.7 0.22 320 / 0.9)' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: '2px solid oklch(0.7 0.22 320 / 0.9)', borderRight: '2px solid oklch(0.7 0.22 320 / 0.9)' }} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: 'oklch(0.7 0.22 320)', filter: 'drop-shadow(0 0 6px oklch(0.7 0.22 320 / 0.8))' }} />
            <span
              className="font-orbitron text-xs tracking-widest font-bold"
              style={{ color: 'oklch(0.7 0.22 320)', textShadow: '0 0 8px oklch(0.7 0.22 320 / 0.8)' }}
            >
              WALLPAPER ACCESS
            </span>
          </div>
          <button
            onClick={onCancel}
            className="w-6 h-6 flex items-center justify-center transition-all duration-150"
            style={{
              background: 'transparent',
              border: '1px solid oklch(0.65 0.22 25 / 0.4)',
              borderRadius: '2px',
              color: 'oklch(0.65 0.22 25 / 0.7)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'oklch(0.65 0.22 25 / 0.2)';
              el.style.borderColor = 'oklch(0.65 0.22 25)';
              el.style.color = 'oklch(0.65 0.22 25)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.borderColor = 'oklch(0.65 0.22 25 / 0.4)';
              el.style.color = 'oklch(0.65 0.22 25 / 0.7)';
            }}
          >
            <X size={10} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'oklch(0.7 0.22 320 / 0.2)' }} />

        {/* Description */}
        <p className="font-mono-tech text-xs" style={{ color: 'oklch(0.85 0.18 195 / 0.6)' }}>
          ENTER PIN TO CHANGE WALLPAPER
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            maxLength={10}
            className="neon-input w-full px-3 py-2 text-center text-lg tracking-[0.5em]"
            style={{ borderRadius: '2px' }}
          />

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: 'oklch(0.65 0.22 25 / 0.1)',
                border: '1px solid oklch(0.65 0.22 25 / 0.5)',
                borderRadius: '2px',
              }}
            >
              <ShieldAlert size={12} style={{ color: 'oklch(0.65 0.22 25)', flexShrink: 0 }} />
              <span className="font-mono-tech text-xs" style={{ color: 'oklch(0.65 0.22 25)' }}>
                {error}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="neon-btn neon-btn-magenta flex-1 py-2"
              style={{ borderRadius: '2px' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!pin.trim()}
              className="neon-btn flex-1 py-2"
              style={{ borderRadius: '2px' }}
            >
              UNLOCK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
