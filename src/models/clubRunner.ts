export default interface ClubRunner {
  id?: string;
  name: string;
  athleteId: string;
  clubId: string;
  peelParkRuns: number;
  totalRuns: number;
}

export interface RunnerStats {
  id: string;
  summary?: RunnerSummary;
  achievements: RunnerAnnualAchievement[];
  results: RunnerResult[];
}

export interface RunnerSummary {
  upper: SummaryDataPoint;
  average: SummaryDataPoint;
  lower: SummaryDataPoint;
}

export interface RunnerAnnualAchievement {
  year: number;
  bestTime: number;
  bestAgeGrade: string;
}

export interface RunnerResult {
  event: string;
  date: string;
  runNumber: number;
  position: number;
  time: number;
  ageGrade: string;
  PB?: boolean;
}

export type SummaryDataPoint = {
  time: number;
  ageGrading: string;
  overallPosition: number;
};
