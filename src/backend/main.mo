import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

actor {
  // Types
  type App = {
    id : Text;
    name : Text;
    url : Text;
    emoji : Text;
    color : Text;
    order : Nat;
  };

  type Settings = {
    wallpaper : Text;
    accentColor : Text;
    openInIframe : Bool;
    showClock : Bool;
    taskbarPosition : Text;
    backgroundEffect : Text;
  };

  module Settings {
    public func default() : Settings {
      {
        wallpaper = "#050510";
        accentColor = "#00f5ff";
        openInIframe = true;
        showClock = true;
        taskbarPosition = "bottom";
        backgroundEffect = "grid";
      };
    };
  };

  // Persistent Storage
  let userApps = Map.empty<Principal, Map.Map<Text, App>>();
  let userSettings = Map.empty<Principal, Settings>();

  // App Management
  public shared ({ caller }) func addApp(app : App) : async () {
    let apps = switch (userApps.get(caller)) {
      case (null) { Map.empty<Text, App>() };
      case (?existing) { existing };
    };
    apps.add(app.id, app);
    userApps.add(caller, apps);
  };

  public shared ({ caller }) func updateApp(app : App) : async () {
    switch (userApps.get(caller)) {
      case (null) { Runtime.trap("No apps found for user") };
      case (?apps) {
        if (not apps.containsKey(app.id)) { Runtime.trap("App not found") };
        apps.add(app.id, app);
      };
    };
  };

  public shared ({ caller }) func deleteApp(appId : Text) : async () {
    switch (userApps.get(caller)) {
      case (null) { Runtime.trap("No apps found for user") };
      case (?apps) {
        if (not apps.containsKey(appId)) { Runtime.trap("App not found") };
        apps.remove(appId);
      };
    };
  };

  public query ({ caller }) func getApps() : async [App] {
    switch (userApps.get(caller)) {
      case (null) { [] };
      case (?apps) {
        apps.values().toArray();
      };
    };
  };

  // Settings Management
  public query ({ caller }) func getSettings() : async Settings {
    switch (userSettings.get(caller)) {
      case (null) { Settings.default() };
      case (?settings) { settings };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    userSettings.add(caller, newSettings);
  };
};
