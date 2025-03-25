import { RunStatus } from "../models/run.model";
import { pointRepo, PointRepo } from "../repos/point.repo";
import { runRepo, RunRepo } from "../repos/run.repo";
import { BadRequestError } from "../errors";
import {
  commitTransaction,
  releaseRunner,
  rollbackTransaction,
  startTransaction,
} from "../packages/db/db";

export class RunService {
  private readonly ptRepo;
  private readonly runRepo;

  constructor(ptRepo: PointRepo, runRepo: RunRepo) {
    this.ptRepo = ptRepo;
    this.runRepo = runRepo;
  }

  async createRun(userId: string, startPoint: number[]) {
    const trx = await startTransaction();
    try {
      const run = await this.runRepo.createRun({ userId }, trx);
      const [latitude, longitude] = startPoint;
      this.validLatLongAlt(latitude, longitude);
      await this.ptRepo.addPoint({ latitude, longitude, run_id: run.id }, trx);
      await commitTransaction(trx);
      return run;
    } catch (e) {
      await rollbackTransaction(trx);
      throw e;
    } finally {
      await releaseRunner(trx);
    }
  }

  async addPoint(userID: string, run_id: string, coordinates: number[]) {
    const run = await this.runRepo.getUserRun(run_id, userID);
    if (!run) throw new BadRequestError("Run not found");
    const [latitude, longitude] = coordinates;
    this.validLatLongAlt(latitude, longitude);
    await this.ptRepo.addPoint({ latitude, longitude, run_id });
    //process and return key run stats incase mobile is not doing so (use redis to hold active runs and associated data???)
  }

  async completeRun(userId: string, run_id: string, finishPoint: number[]) {
    const trx = await startTransaction();
    try {
      const run = await this.runRepo.getUserRun(run_id, userId);
      if (!run) throw new BadRequestError("Run not found");
      const [latitude, longitude] = finishPoint;
      this.validLatLongAlt(latitude, longitude);
      await this.ptRepo.addPoint({ latitude, longitude, run_id });

      run.finishedAt = new Date();
      run.status = RunStatus.COMPLETED;

      //compute stats and update
      await this.runRepo.save(run);
      await commitTransaction(trx);
      return run;
    } catch (e) {
      await rollbackTransaction(trx);
      throw e;
    } finally {
      releaseRunner(trx);
    }
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
}

export const runService = new RunService(pointRepo, runRepo);
