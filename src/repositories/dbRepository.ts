import { Client, Pool } from "pg";
import format from "pg-format";
import RunningClub from "../models/club";
import { mapRunner, mapRunningClub } from "../mappers/dbMappers";
import ClubRunners, { RunnerStats } from "../models/clubRunner";

class DBConnection {
  private static _instance: Pool;
  static getInstance() {
    if (this._instance == undefined) {
      this._instance = new Pool({
        connectionString: Bun.env.POSTGRES_URL,
      });
    }

    return DBConnection._instance;
  }
}

export async function addRunningClubData(data: RunningClub[]) {
  const client = await DBConnection.getInstance().connect();
  const values = data.map((club) => {
    return [club.id, club.name, club.parkRunners, club.runs];
  });

  const result = await client.query(format("INSERT INTO running_clubs(id, name, park_runners, runs) VALUES %L", values));
  client.release();

  return result;
}

export async function getRunningClubs() {
  const client = await DBConnection.getInstance().connect();

  const result = await client.query("SELECT * from running_clubs");
  client.release();

  return result.rows.map((r) => mapRunningClub(r));
}

export async function getRunners() {
  const client = await DBConnection.getInstance().connect();

  const result = await client.query(
    "SELECT * FROM running_club_runners WHERE athlete_id NOT IN ( SELECT runner_id FROM runner_stats_results GROUP BY runner_id )"
  );
  client.release();

  return result.rows.map((r) => mapRunner(r));
}

export async function addRunningClubRunnersData(data: ClubRunners[]) {
  const client = await DBConnection.getInstance().connect();

  const values = data.map((athlete) => {
    return [athlete.athleteId, athlete.clubId, athlete.peelParkRuns, athlete.name, athlete.totalRuns];
  });

  console.log("executing query");
  try {
    const result = await client.query(
      format("INSERT INTO running_club_runners(athlete_id, club_id, peel_park_runs, runner_name, total_park_runs) VALUES %L", values)
    );

    return result;
  } catch (e) {
    console.log(`Error: ${e}`);
  } finally {
    client.release();
  }
}

export async function doesClubDataAlreadyExist(clubId: string) {
  const client = await DBConnection.getInstance().connect();
  const result = await client.query("SELECT club_id FROM running_club_runners WHERE club_id=$1 GROUP BY club_id", [clubId.toString()]);
  client.release();
  return result.rows.length > 0;
}

export async function doesRunnersStatsExist(runnerId: string) {
  const client = await DBConnection.getInstance().connect();
  const result = await client.query("SELECT runner_id from runner_stats_results WHERE runner_id=$1", [runnerId.toString()]);
  client.release();
  return result.rows.length > 0;
}

export async function addRunnerStats(data: RunnerStats) {
  const client = await DBConnection.getInstance().connect();

  const summary = [
    [data.id, "lower", data.summary?.lower.time, data.summary?.lower.overallPosition, data.summary?.lower.ageGrading],
    [data.id, "average", data.summary?.average.time, data.summary?.average.overallPosition, data.summary?.average.ageGrading],
    [data.id, "upper", data.summary?.upper.time, data.summary?.upper.overallPosition, data.summary?.upper.ageGrading],
  ];

  const summaryResult = await client.query(
    format("INSERT INTO runner_stats_summary(runner_id, category, time, overall_position, age_grading) VALUES %L", summary)
  );

  const achievements = data.achievements.map((a) => {
    return [data.id, a.year, a.bestTime, a.bestAgeGrade];
  });

  const achievementsResult = await client.query(
    format("INSERT INTO runner_stats_achievements(runner_id, year, best_time, best_age_grade) VALUES %L", achievements)
  );

  const results = data.results.map((r) => {
    return [data.id, r.event, r.date, r.runNumber, r.position, r.time, r.ageGrade, r.PB];
  });

  const resultsResult = await client.query(
    format("INSERT INTO runner_stats_results(runner_id, event, date, run_number, position, time, age_grade, pb) VALUES %L", results)
  );

  client.release();

  return {
    summary: summaryResult.command,
    achievementsResult: achievementsResult.command,
    resultsResult: resultsResult.command,
  };
}

export async function findDuplicatesInRunnerStatsResults() {
  const client = await DBConnection.getInstance().connect();
  const result = await client.query(
    `SELECT results_key, runner_id, date FROM runner_stats_results WHERE (runner_id, date, event) IN ( SELECT runner_id, date, event FROM runner_stats_results GROUP BY runner_id, date, event HAVING COUNT(*) > 1 ) ORDER BY date, runner_id;`
  );
  client.release();

  return result.rows;
}
