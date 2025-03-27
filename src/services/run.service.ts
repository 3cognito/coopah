import { Run, RunStatus } from "../models/run.model";
import { pointRepo, PointRepo } from "../repos/point.repo";
import { runRepo, RunRepo } from "../repos/run.repo";
import { BadRequestError, NotFoundError } from "../errors";
import {
  commitTransaction,
  releaseRunner,
  rollbackTransaction,
  startTransaction,
} from "../packages/db/db";
import { RedisClient, redisClient } from "../packages/db";
import { RunStat } from "../dto/run.dto";
import { Point } from "../models/point.model";
import { computeStats, updateStat, mapRunToRunStat } from "./stats.service";
import { QueryRunner } from "typeorm";

export type ComputablePoint = Pick<
  Point,
  "latitude" | "longitude" | "timestamp"
>;

export class RunService {
  private readonly ptRepo;
  private readonly runRepo;
  private readonly redisClient;

  constructor(ptRepo: PointRepo, runRepo: RunRepo, redisClient: RedisClient) {
    this.ptRepo = ptRepo;
    this.runRepo = runRepo;
    this.redisClient = redisClient;
  }

  async createRun(userId: string, startPoint: number[]) {
    const trx = await startTransaction();
    try {
      const run = await this.runRepo.createRun({ userId }, trx);

      const [latitude, longitude] = startPoint;
      this.validLatLongAlt(latitude, longitude);

      const point = await this.ptRepo.addPoint(
        { latitude, longitude, run_id: run.id },
        trx
      );
      await commitTransaction(trx);

      const runstat = mapRunToRunStat(run, point);
      this.addRuntoRedis(runstat);
      return runstat;
    } catch (e) {
      await rollbackTransaction(trx);
      throw e;
    } finally {
      await releaseRunner(trx);
    }
  }

  async addPoint(userID: string, run_id: string, coordinates: number[]) {
    const [latitude, longitude] = coordinates;
    this.validLatLongAlt(latitude, longitude);
    const newPoint = this.coordinatesToPoint(coordinates);
    let activeRun = await this.getRunFromRedis(run_id, userID);

    if (!activeRun) {
      const existingRun = await this.runRepo.getUserRun(run_id, userID);
      if (!existingRun) throw new NotFoundError("Run not found");
      if (!existingRun.inProgress()) {
        throw new BadRequestError("Run already completed");
      }

      const pts = await this.ptRepo.getRunPoints(run_id);
      const run_stat = computeStats(
        existingRun,
        [newPoint, ...pts],
        RunStatus.IN_PROGRESS
      );
      await this.ptRepo.save(newPoint); //push to queue??

      this.addRuntoRedis(run_stat);
      return run_stat;
    }

    const run_stat = updateStat(activeRun, newPoint, RunStatus.IN_PROGRESS);
    this.addRuntoRedis(run_stat);
    await this.ptRepo.save(newPoint); //use queue???
    return run_stat;
  }

  async completeRun(userId: string, run_id: string, finishPoint: number[]) {
    const [latitude, longitude] = finishPoint;
    this.validLatLongAlt(latitude, longitude);
    try {
      const existingStat = await this.getRunFromRedis(run_id, userId);
      const newPoint = this.coordinatesToPoint(finishPoint);
      const run = await this.runRepo.getUserRun(run_id, userId);

      if (!run) throw new NotFoundError("Run not found");
      if (!run.inProgress()) throw new BadRequestError("Run already completed");

      let stat: RunStat;
      if (existingStat) {
        stat = updateStat(existingStat, newPoint, RunStatus.COMPLETED);
      } else {
        const pts = await this.ptRepo.getRunPoints(run.id);
        stat = computeStats(run, [newPoint, ...pts], RunStatus.COMPLETED);
      }
      stat.status = RunStatus.COMPLETED;

      const trx = await startTransaction();
      try {
        await this.markRunCompleted(trx, run, stat);
        await this.ptRepo.addPoint(newPoint, trx); //should I update run final status and pt in trx or send pt to queue and update run alone??????
        await commitTransaction(trx);
        this.redisClient.deleteObject(run.id);
        return stat;
      } catch (e) {
        console.error(e);
        rollbackTransaction(trx);
      } finally {
        releaseRunner(trx);
      }
    } catch (e) {
      throw e;
    }
    //delete redis entry or expire
  }

  async getUserCompletedRuns(userId: string) {
    return await this.runRepo.getUserCompletedRuns(userId);
  }

  async getRun(userId: string, runId: string) {
    const run = await this.runRepo.getUserRun(runId, userId);
    if (!run) throw new BadRequestError("Run not found");
    const runPts = await this.ptRepo.getRunPoints(run.id);
    //aggregate and format
    return { run, mapPoints: runPts };
  }

  private validLatLongAlt(lat: number, long: number) {
    if (lat < -90 || lat > 90) {
      throw new BadRequestError("Latitude must be between -90 and 90 degrees.");
    }
    if (long < -180 || long > 180) {
      throw new BadRequestError(
        "Longitude must be between -180 and 180 degrees."
      );
    }
  }

  private async markRunCompleted(
    trx: QueryRunner,
    run: Run,
    finalStat: RunStat
  ) {
    run.status = RunStatus.COMPLETED;
    run.finishedAt = new Date(finalStat.lastTimestamp);
    run.speed = finalStat.speed;
    run.timeElapsed = finalStat.timeElapsed;
    run.pace = finalStat.pace;
    run.totalDistance = finalStat.totalDistance;
    return await this.runRepo.saveRun(run, trx);
  }

  private coordinatesToPoint(coordinates: number[]) {
    const pt: ComputablePoint = {
      latitude: coordinates[0],
      longitude: coordinates[1],
      timestamp: new Date(),
    };
    return pt;
  }

  private async addRuntoRedis(r: RunStat) {
    try {
      await this.redisClient.addObject(r.runId, r);
    } catch (e) {
      console.error(e);
    }
  }

  private async getRunFromRedis(id: string, userId: string) {
    try {
      const d = await this.redisClient.getObject(id, RunStat);
      if (d && d.userId == userId) return d;
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}

export const runService = new RunService(pointRepo, runRepo, redisClient);
