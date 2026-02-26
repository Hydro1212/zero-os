import React, { useRef, useEffect } from "react";

interface WallpaperProps {
  url: string;
}

export default function Wallpaper({ url }: WallpaperProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo =
    url.endsWith(".mp4") ||
    url.includes("video/mp4") ||
    (url.startsWith("blob:") && url.length > 5);

  // Attempt autoplay with sound; browsers may block unmuted autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.muted = false;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If unmuted autoplay is blocked, fall back to muted
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [url, isVideo]);

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    pointerEvents: "none",
  };

  if (!url) {
    return (
      <div
        style={{
          ...baseStyle,
          background:
            "radial-gradient(ellipse at 20% 50%, oklch(0.12 0.04 240) 0%, oklch(0.06 0.02 240) 60%, oklch(0.04 0.01 240) 100%)",
        }}
      />
    );
  }

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        key={url}
        src={url}
        style={baseStyle}
        autoPlay
        loop
        playsInline
        muted={false}
      />
    );
  }

  return <img src={url} style={baseStyle} alt="" />;
}
