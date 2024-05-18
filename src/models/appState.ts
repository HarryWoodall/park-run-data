export default class AppState {
  isRunning = false;
  runningState: "None" | "Clubs" | "Runners" = "None";

  private static _Instance: AppState | undefined;

  public static getInstance() {
    if (AppState._Instance === undefined) {
      AppState._Instance = new AppState();
    }

    return AppState._Instance;
  }
}
