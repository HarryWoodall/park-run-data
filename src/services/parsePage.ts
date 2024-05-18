import type { Element } from "cheerio";
import * as cheerio from "cheerio";
import RunningClub from "../models/club";
import ClubRunners, { RunnerStats } from "../models/clubRunner";
import { convertToSeconds } from "../helpers/timeHelpers";

export default async function parseGroupsPage() {
  const $ = cheerio.load(await Bun.file(`${process.cwd()}/data/html/peelGroups.html`).text());
  const items: string[] = [];
  const clubs: RunningClub[] = [];

  const elements = $("#results").find("tr a, tr td");

  elements.toArray().forEach((element: Element) => {
    if (element.tagName == "a" && !element.firstChild!.data.toLowerCase().includes("home page")) {
      items.push(element.attribs.href.split("=")[1]);
    }

    //@ts-ignore
    if (element.firstChild.data && element.firstChild.data.trim() != "" && !element.firstChild.data.toLowerCase().includes("home page")) {
      //@ts-ignore
      items.push(element.firstChild.data);
    }
  });

  for (let i = 0; i < items.length; ) {
    clubs.push({
      id: parseInt(items[i]),
      name: items[i + 1],
      parkRunners: parseInt(items[i + 2]),
      runs: parseInt(items[i + 3]),
    });

    i += 4;
  }

  return clubs;
}

export async function parseClubHistoryPage(name: string, clubId: string) {
  const $ = cheerio.load(await Bun.file(`${process.cwd()}/data/html/club_${name}.html`).text());
  const tableBody = $("tbody").find("tr");
  const clubRunners: ClubRunners[] = [];
  tableBody.each((i, element) => {
    const cherioNode = cheerio.load(element);
    let athleteId: string | undefined = "";
    let athleteName: string | undefined = "";
    if (cherioNode("a").attr("target") == "_top") {
      athleteId = cherioNode("a").attr("href")?.split("=")[1];
      athleteName = cherioNode("a").text();
    }

    const data = [...cherioNode("td").contents()].filter((e) => e.type == "text" && cherioNode(e).text().trim()).map((e) => $(e).text().trim());

    clubRunners.push({
      name: athleteName,
      peelParkRuns: parseInt(data[0]),
      totalRuns: parseInt(data[1]),
      clubId: clubId,
      athleteId: athleteId!,
    });
  });

  return clubRunners;
}

export async function parseClubRunner(name: string, id: string) {
  const $ = cheerio.load(await Bun.file(`${process.cwd()}/data/html/runner_${name}.html`).text());
  const tables = $("#results tbody");

  const runnerData: RunnerStats = {
    id: id,
    achievements: [],
    results: [],
  };

  tables.map((index, t) => {
    const rows = cheerio.load(t)("tr");
    const currentTableData: string[][] = [];
    rows.each((i, element) => {
      const cherioNode = cheerio.load(element);
      if (cherioNode("a").attr("target") == "_top") {
      }

      const data = [...cherioNode("td, td a").contents()].filter((e) => e.type == "text" && cherioNode(e).text().trim()).map((e) => $(e).text().trim());
      currentTableData.push(data);
    });

    if (index == 0) {
      runnerData.summary = {
        upper: {
          time: convertToSeconds(currentTableData[0][1]),
          ageGrading: currentTableData[1][1],
          overallPosition: parseInt(currentTableData[2][1]),
        },
        average: {
          time: convertToSeconds(currentTableData[0][2]),
          ageGrading: currentTableData[1][2],
          overallPosition: parseInt(currentTableData[2][2]),
        },
        lower: {
          time: convertToSeconds(currentTableData[0][3]),
          ageGrading: currentTableData[1][3],
          overallPosition: parseInt(currentTableData[2][3]),
        },
      };
    }

    if (index == 1) {
      currentTableData.forEach((item) => {
        runnerData.achievements.push({
          year: parseInt(item[0]),
          bestTime: convertToSeconds(item[1]),
          bestAgeGrade: item[2],
        });
      });
    }

    if (index == 2) {
      currentTableData.forEach((item) => {
        runnerData.results.push({
          event: item[0],
          date: item[1],
          runNumber: parseInt(item[2]),
          position: parseInt(item[3]),
          time: convertToSeconds(item[4]),
          ageGrade: item[5],
          PB: item.length == 7 ? true : false,
        });
      });
    }
  });

  return runnerData;
}
