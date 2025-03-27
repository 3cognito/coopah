import { RunStat } from "../dto/run.dto";
import { Run, RunStatus } from "../models/run.model";
import { ComputablePoint } from "./run.service";

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

interface Coordinates {
  latitude: number;
  longitude: number;
}

function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export type NonEmptyArray<T> = [T, ...T[]];

export function computeStats(
  run: Run,
  points: NonEmptyArray<ComputablePoint>,
  status: RunStatus
): RunStat {
  const run_stat = new RunStat();

  if (points.length == 1) {
    return mapRunToRunStat(run, points[0]);
  }

  points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  run_stat.totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    run_stat.totalDistance += haversineDistance(
      { latitude: points[i - 1].latitude, longitude: points[i - 1].longitude },
      { latitude: points[i].latitude, longitude: points[i].longitude }
    );
  }

  const startTime = points[0].timestamp;
  const endTime = points[points.length - 1].timestamp;
  run_stat.timeElapsed = (endTime.getTime() - startTime.getTime()) / 1000; // to seconds
  run_stat.speed = run_stat.totalDistance / run_stat.timeElapsed;
  run_stat.pace = 1 / run_stat.speed;
  run_stat.runId = run.id;
  run_stat.userId = run.userId;
  run_stat.lastCoordinates = [
    points[points.length - 1].latitude,
    points[points.length - 1].longitude,
  ];
  run_stat.lastTimestamp = points[points.length - 1].timestamp.getTime();
  run_stat.startTimestamp = points[0].timestamp.getTime();
  run_stat.status = status;
  return run_stat;
}

export function updateStat(
  run_stat: RunStat,
  pt: ComputablePoint,
  status: RunStatus
) {
  if (run_stat.lastTimestamp > pt.timestamp.getTime()) {
    return run_stat;
  }
  const currentCoordinates = [pt.latitude, pt.longitude];
  run_stat.totalDistance += haversineDistance(
    {
      latitude: run_stat.lastCoordinates[0],
      longitude: run_stat.lastCoordinates[1],
    },
    {
      latitude: pt.latitude,
      longitude: pt.longitude,
    }
  );

  const timeElapsed = (pt.timestamp.getTime() - run_stat.lastTimestamp) / 1000;
  run_stat.timeElapsed += timeElapsed;
  run_stat.speed = run_stat.totalDistance / run_stat.timeElapsed;
  run_stat.pace = run_stat.timeElapsed / run_stat.totalDistance;
  run_stat.status = status;
  run_stat.lastCoordinates = currentCoordinates;

  return run_stat;
}

export function mapRunToRunStat(run: Run, pt: ComputablePoint): RunStat {
  const {
    id: runId,
    userId,
    speed,
    pace,
    status,
    totalDistance,
    createdAt,
    timeElapsed,
  } = run;

  const { latitude, longitude, timestamp } = pt;

  return {
    runId,
    userId,
    speed,
    pace,
    lastCoordinates: [latitude, longitude],
    lastTimestamp: timestamp.getTime(),
    status,
    totalDistance,
    startTimestamp: createdAt.getTime(),
    timeElapsed,
  };
}
