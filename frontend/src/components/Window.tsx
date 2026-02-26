import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { WindowBorderGlow, UITransparency } from '../backend';
import type { Settings } from '../backend';

type WindowBorderGlowValue = Settings['windowBorderGlow'];
type UITransparencyValue = Settings['uiTransparency'];

interface WindowProps {
  id: string;
  title: string;
  url: string;
  isMinimized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  windowBorderGlow?: WindowBorderGlowValue;
  uiTransparency?: UITransparencyValue;
}

function getGlowStyle(glow: WindowBorderGlowValue | undefined): string {
  switch (glow) {
    case WindowBorderGlow.none: return 'none';
    case WindowBorderGlow.intense: return '0 0 16px oklch(0.85 0.2 195 / 0.8), 0 0 40px oklch(0.85 0.2 195 / 0.4), 0 0 80px oklch(0.85 0.2 195 / 0.2)';
    default: return '0 0 8px oklch(0.85 0.2 195 / 0.4), 0 0 20px oklch(0.85 0.2 195 / 0.15)';
  }
}

function getBlurStyle(transparency: UITransparencyValue | undefined): string {
  switch (transparency) {
    case UITransparency.none: return 'blur(0px)';
    case UITransparency.low: return 'blur(4px)';
    case UITransparency.high: return 'blur(24px)';
    default: return 'blur(12px)';
  }
}

function getBgColor(transparency: UITransparencyValue | undefined): string {
  switch (transparency) {
    case UITransparency.none: return 'oklch(0.08 0.02 240 / 0.98)';
    case UITransparency.low: return 'oklch(0.08 0.02 240 / 0.88)';
    case UITransparency.high: return 'oklch(0.08 0.02 240 / 0.55)';
    default: return 'oklch(0.08 0.02 240 / 0.75)';
  }
}

export default function Window({
  id,
  title,
  url,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  windowBorderGlow = WindowBorderGlow.subtle,
  uiTransparency = UITransparency.medium,
}: WindowProps) {
  const [position, setPosition] = useState({ x: 80 + Math.random() * 120, y: 60 + Math.random() * 80 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    onFocus();
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [isMaximized, position, onFocus]);

  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
  }, [size, onFocus]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y)),
        });
      }
      if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        setSize({
          width: Math.max(400, resizeStart.current.w + dx),
          height: Math.max(300, resizeStart.current.h + dy),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, size.width]);

  if (isMinimized) return null;

  const glowStyle = getGlowStyle(windowBorderGlow);
  const backdropBlur = getBlurStyle(uiTransparency);
  const bgColor = getBgColor(uiTransparency);

  return (
    <div
      onClick={onFocus}
      style={{
        position: 'fixed',
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? 'calc(100vh - 56px)' : size.height,
        zIndex,
        boxShadow: glowStyle,
        backdropFilter: backdropBlur,
        WebkitBackdropFilter: backdropBlur,
        background: bgColor,
        border: '1px solid oklch(0.85 0.2 195 / 0.25)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={handleMouseDownDrag}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          height: '36px',
          background: 'oklch(0.12 0.04 240 / 0.9)',
          borderBottom: '1px solid oklch(0.85 0.2 195 / 0.3)',
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'oklch(0.85 0.2 195)', boxShadow: '0 0 6px oklch(0.85 0.2 195)' }} />
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '11px', color: 'oklch(0.85 0.2 195)', letterSpacing: '0.1em', textTransform: 'uppercase', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }} onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid oklch(0.75 0.15 60 / 0.5)', background: 'oklch(0.75 0.15 60 / 0.15)', color: 'oklch(0.85 0.15 60)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.75 0.15 60 / 0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.75 0.15 60 / 0.15)'; }}
          >
            <Minus size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
            style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid oklch(0.85 0.2 195 / 0.5)', background: 'oklch(0.85 0.2 195 / 0.15)', color: 'oklch(0.85 0.2 195)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.85 0.2 195 / 0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.85 0.2 195 / 0.15)'; }}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid oklch(0.65 0.25 25 / 0.5)', background: 'oklch(0.65 0.25 25 / 0.15)', color: 'oklch(0.75 0.25 25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.25 25 / 0.5)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.25 25 / 0.15)'; }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <iframe
          src={url}
          title={title}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '16px',
            height: '16px',
            cursor: 'se-resize',
            background: 'linear-gradient(135deg, transparent 50%, oklch(0.85 0.2 195 / 0.4) 50%)',
          }}
        />
      )}
    </div>
  );
}
