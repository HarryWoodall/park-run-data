import { Elysia, t } from "elysia";
import writeHtmlFile, { deleteHtmlFile, readHtmlFile } from "../services/pageIO";
import parseGroupsPage, { parseClubHistoryPage, parseClubRunner } from "../services/parsePage";
import { addRunnerStats, addRunningClubData, doesRunnersStatsExist, getRunners, getRunningClubs } from "../repositories/dbRepository";
import Bottleneck from "bottleneck";
import { gatherRunningClubRunnersData, gatheringRunningClubData } from "../services/dataService";
import { getTimeStamp } from "../helpers/timeHelpers";
import AppState from "../models/appState";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 10000,
});

const dataRoutes = new Elysia({ prefix: "/data" })
  .get("/getRunningClubs", async () => {
    if (AppState.getInstance().isRunning && AppState.getInstance().runningState === "Clubs") {
      return "Club gatherer already started";
    }

    gatheringRunningClubData(limiter);
    AppState.getInstance().isRunning = true;
    AppState.getInstance().runningState = "Clubs";
    return "starting gathering club data";
  })
  .get("/getRunningClubRunners", async () => {
    if (AppState.getInstance().isRunning && AppState.getInstance().runningState === "Runners") {
      return "Runner gatherer already started";
    }

    gatherRunningClubRunnersData(limiter);
    AppState.getInstance().isRunning = true;
    AppState.getInstance().runningState = "Runners";
    return "started gathering running data";
  })
  .get("/stopApp", () => {
    AppState.getInstance().isRunning = false;
    AppState.getInstance().runningState = "None";
    return "Stopped app";
  })
  .get("/getHtmlFile", async () => {
    await writeHtmlFile(`https://www.parkrun.org.uk/peel/results/clubhistory/?clubNum=24338`, `club_Ramsbottom Running Club.html`);
    return readHtmlFile(`club_Ramsbottom Running Club.html`);
  });
export { dataRoutes };
