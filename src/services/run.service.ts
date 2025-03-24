import { RunStatus } from "../models/run.model";
import { pointRepo, PointRepo } from "../repos/point.repo";
import { runRepo, RunRepo } from "../repos/run.repo";
import { BadRequestError } from "../errors";

export class RunService {
  private readonly ptRepo;
  private readonly runRepo;

  constructor(ptRepo: PointRepo, runRepo: RunRepo) {
    this.ptRepo = ptRepo;
    this.runRepo = runRepo;
  }

  async createRun(userID: string, startPoint: number[]) {
    await this.ptRepo.queryRunner?.startTransaction();
    try {
      const run = await this.runRepo.createRun({ userID });
      const [latitude, longitude, altitude] = startPoint;
      this.validLatLongAlt(latitude, longitude, altitude);
      await this.ptRepo.addPoint({ latitude, longitude, altitude });
      await this.ptRepo.queryRunner?.commitTransaction();
      return run;
    } catch (e) {
      await this.ptRepo.queryRunner?.rollbackTransaction();
      throw e;
    }
  }

  async addPoint(run_id: string, coordinates: number[]) {
    const run = await this.runRepo.getRun(run_id);
    if (!run) throw new BadRequestError("Run not found");
    const [latitude, longitude, altitude] = coordinates;
    this.validLatLongAlt(latitude, longitude, altitude);
    await this.ptRepo.addPoint({ latitude, longitude, altitude });
    //process and return key run stats incase mobile is not doing so (use redis to hold active runs and associated data???)
  }

  async completeRun(run_id: string, finishPoint: number[]) {
    await this.ptRepo.queryRunner?.startTransaction();
    try {
      const run = await this.runRepo.getRun(run_id);
      if (!run) throw new BadRequestError("Run not found");
      const [latitude, longitude, altitude] = finishPoint;
      this.validLatLongAlt(latitude, longitude, altitude);
      await this.ptRepo.addPoint({ latitude, longitude, altitude });

      run.finishedAt = new Date();
      run.status = RunStatus.COMPLETED;

      //compute stats and update
      await this.runRepo.save(run);
      await this.ptRepo.queryRunner?.commitTransaction();
      return run;
    } catch (e) {
      await this.ptRepo.queryRunner?.rollbackTransaction();
      throw e;
    }
  }

  async getRunPoints(runId: string) {
    return await this.ptRepo.getRunPoints(runId);
  }

  async getUserCompletedRuns(userId: string) {
    return await this.runRepo.getUserCompletedRuns(userId);
  }

  //   // Computes total distance and elapsed time for a run
  //   async getRunSummary(
  //     runId: string
  //   ): Promise<{ totalDistance: number; timeElapsed: number }> {}

  private validLatLongAlt(lat: number, long: number, alt: number) {
    if (lat < -90 || lat > 90) {
      throw new BadRequestError("Latitude must be between -90 and 90 degrees.");
    }
    if (long < -180 || long > 180) {
      throw new BadRequestError(
        "Longitude must be between -180 and 180 degrees."
      );
    }
    if (alt < 0) {
      throw new BadRequestError("Altitude cannot be negative.");
    }
  }
}

export const runService = new RunService(pointRepo, runRepo);
