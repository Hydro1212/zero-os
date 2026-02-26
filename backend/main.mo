import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type AppEntry = {
    id : Text;
    name : Text;
    url : Text;
    position : (Nat, Nat);
  };

  module AppEntry {
    public func compare(entry1 : AppEntry, entry2 : AppEntry) : Order.Order {
      Text.compare(entry1.id, entry2.id);
    };
  };

  let apps = Map.empty<Text, AppEntry>();

  type AccentColor = {
    #cyan;
    #magenta;
    #green;
  };

  type FontSize = {
    #small;
    #medium;
    #large;
  };

  type UITransparency = {
    #none;
    #low;
    #medium;
    #high;
  };

  type ClockFormat = {
    #hour12;
    #hour24;
  };

  type TaskbarHeight = {
    #compact;
    #normal;
    #tall;
  };

  type IconSize = {
    #small;
    #medium;
    #large;
  };

  type ParticleIntensity = {
    #off;
    #low;
    #medium;
    #high;
  };

  type ScanlineEffect = {
    #on;
    #off;
  };

  type GridOverlay = {
    #on;
    #off;
  };

  type WindowBorderGlow = {
    #none;
    #subtle;
    #intense;
  };

  type VideoSettings = {
    isMuted : Bool;
    volume : Nat8;
    playbackSpeed : Float;
  };

  var videoSettings : VideoSettings = {
    isMuted = false;
    volume = 50;
    playbackSpeed = 1.0;
  };

  public shared ({ caller }) func updateVideoSettings(newVideoSettings : VideoSettings) : async () {
    videoSettings := newVideoSettings;
  };

  public query ({ caller }) func getVideoSettings() : async VideoSettings {
    videoSettings;
  };

  // Check if a file exists in a directory
  public shared ({ caller }) func doesFileExist(directoryId : Text, fileName : Text) : async Bool {
    false;
  };

  // Settings management
  public type Settings = {
    accentColor : AccentColor;
    wallpaperUrl : Text;
    desktopLabel : Text;
    fontSize : FontSize;
    uiTransparency : UITransparency;
    clockFormat : ClockFormat;
    taskbarHeight : TaskbarHeight;
    iconSize : IconSize;
    particleIntensity : ParticleIntensity;
    scanlineEffect : ScanlineEffect;
    gridOverlay : GridOverlay;
    windowBorderGlow : WindowBorderGlow;
  };

  var settings : Settings = {
    accentColor = #cyan;
    wallpaperUrl = "";
    desktopLabel = "My DFINITY Desktop";
    fontSize = #medium;
    uiTransparency = #medium;
    clockFormat = #hour24;
    taskbarHeight = #normal;
    iconSize = #medium;
    particleIntensity = #medium;
    scanlineEffect = #on;
    gridOverlay = #on;
    windowBorderGlow = #subtle;
  };

  // Add a new app
  public shared ({ caller }) func addApp(id : Text, name : Text, url : Text) : async () {
    if (apps.containsKey(id)) { Runtime.trap("App already exists") };
    let app : AppEntry = {
      id;
      name;
      url;
      position = (0, 0);
    };
    apps.add(id, app);
  };

  // Get a specific app
  public query ({ caller }) func getApp(id : Text) : async AppEntry {
    switch (apps.get(id)) {
      case (null) { Runtime.trap("App not found") };
      case (?app) { app };
    };
  };

  public query ({ caller }) func getSettings() : async Settings {
    settings;
  };

  public shared ({ caller }) func saveSettings(newSettings : Settings) : async () {
    settings := newSettings;
  };
};
