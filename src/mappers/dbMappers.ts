import RunningClub from "../models/club";
import ClubRunner from "../models/clubRunner";

export function mapRunningClub(data: any): RunningClub {
  return {
    id: data.id,
    name: data.name,
    parkRunners: data.park_runners,
    runs: data.runs,
  };
}

export function mapRunner(data: any): ClubRunner {
  return {
    id: data.id,
    athleteId: data.athlete_id,
    clubId: data.club_id,
    name: data.runner_name,
    peelParkRuns: data.peel_park_runs,
    totalRuns: data.total_park_runs,
  };
}
