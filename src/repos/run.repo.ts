import { Between, FindManyOptions, QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../packages/db/db";
import { validateEntity } from "../utils/validator";
import { BadRequestError, ValidationError } from "../errors";
import { Run, RunStatus } from "../models/run.model";
import { DateRange, parseDate, validateDateRange } from "../utils/date";

type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export class RunRepo extends Repository<Run> {
  constructor() {
    super(Run, AppDataSource.manager);
  }

  async createRun(run: Partial<Run>, trx?: QueryRunner) {
    const { ok, errors } = await validateEntity(run);
    if (ok) {
      let newRun: Run;
      trx
        ? (newRun = await trx.manager.save(this.create(run)))
        : (newRun = await this.save(this.create(run)));
      return newRun;
    }
    throw new ValidationError(errors.join(" "));
  }

  async saveRun(run: Run, trx?: QueryRunner) {
    let updatedRun: Run;
    trx
      ? (updatedRun = await trx.manager.save(run))
      : (updatedRun = await this.save(run));
    return updatedRun;
  }

  async updateRun(run: PartialWithRequired<Run, "id">) {
    return await this.save(run);
  }

  async getRunById(id: string) {
    return await this.findOne({ where: { id } });
  }

  async getUserRun(id: string, userId: string) {
    return await this.findOne({ where: { id, userId } });
  }

  async getUserCompletedRuns(userId: string, dateRange?: DateRange) {
    if (dateRange) {
      const { isValid, errorMessage } = validateDateRange(dateRange);
      if (!isValid) throw new BadRequestError(errorMessage);

      const startDate = parseDate(dateRange.start_date);
      const endDate = parseDate(dateRange.end_date);

      return await this.find({
        where: {
          userId,
          status: RunStatus.COMPLETED,
          finishedAt: Between(startDate, endDate),
        },
      });
    }

    return await this.find({
      where: {
        userId,
        status: RunStatus.COMPLETED,
      },
    });
  }
}

export const runRepo = new RunRepo();
