import Bottleneck from "bottleneck";
import {
  addRunnerStats,
  addRunningClubData,
  addRunningClubRunnersData,
  doesClubDataAlreadyExist,
  doesRunnersStatsExist,
  getRunners,
  getRunningClubs,
} from "../repositories/dbRepository";
import writeHtmlFile, { deleteHtmlFile } from "./pageIO";
import { parseClubRunner, parseClubHistoryPage } from "./parsePage";
import AppState from "../models/appState";

export async function gatheringRunningClubData(limiter: Bottleneck) {
  const data = await getRunningClubs();

  for (let i = 0; i < data.length; i++) {
    if (!(AppState.getInstance().isRunning && AppState.getInstance().runningState == "Clubs")) {
      console.log(`Stopping club runner`);
      return;
    }

    const club = data[i];
    const clubExists = await doesClubDataAlreadyExist(club.id.toString());

    if (!club.id || clubExists) {
      console.log(`${club.name} already exists`);
      continue;
    }

    await limiter.schedule(() => writeHtmlFile(`https://www.parkrun.org.uk/peel/results/clubhistory/?clubNum=${club.id}`, `club_${club.name}.html`));
    const runners = await parseClubHistoryPage(club.name, club.id.toString());
    deleteHtmlFile(`club_${club.name}.html`);

    if (!runners || runners.length == 0) {
      console.log(`No data returned for ${club.name}`);
      continue;
    }

    await addRunningClubRunnersData(runners);
  }
}

export async function gatherRunningClubRunnersData(limiter: Bottleneck) {
  const data = await getRunners();

  for (let i = 0; i < data.length; i++) {
    if (!(AppState.getInstance().isRunning && AppState.getInstance().runningState == "Runners")) {
      console.log(`Stopping athlete runner`);
      return;
    }

    const runner = data[i];
    const runnerExists = await doesRunnersStatsExist(runner.athleteId!);

    if (!runner.id || runnerExists) {
      console.log(`${runner.name} already exists`);
      continue;
    }

    await limiter.schedule(() => writeHtmlFile(`https://www.parkrun.org.uk/parkrunner/${runner.athleteId}/all`, `runner_${runner.name}.html`));
    const pageData = await parseClubRunner(runner.name, runner.athleteId);
    deleteHtmlFile(`runner_${runner.name}.html`);
    await addRunnerStats(pageData);
  }
}
