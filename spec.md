# Specification

## Summary
**Goal:** Add a windowed Settings app, local MP4 wallpaper upload with audio, and reliable app persistence to the Zero OS desktop.

**Planned changes:**
- Add a "Settings" app icon to the desktop that opens the settings UI inside a draggable, resizable neon window with minimize/maximize/close controls and organized sections (Appearance, Wallpaper, Desktop, Taskbar, Effects, Clock)
- Add an "Upload MP4" file input in the Wallpaper section of the Settings app; on selection, upload the file to the Motoko backend (stored as [Nat8]); expose `uploadWallpaperVideo` and `getWallpaperVideo` endpoints
- Render the uploaded MP4 as a full-screen looping background `<video>` element with autoplay, loop, unmuted audio, and object-fit cover; PIN (2011) protection applies to this upload as well
- Fix app CRUD persistence: wait for backend confirmation before updating local state on add/remove, invalidate React Query cache after each operation, show neon error toasts on failure, and remove stale local state overrides

**User-visible outcome:** Users can open Settings as a proper desktop window, upload an MP4 from their device as a sound-enabled wallpaper, and reliably add or remove apps that persist across page refreshes for all visitors.
