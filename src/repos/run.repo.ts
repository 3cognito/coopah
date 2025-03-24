import { QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../packages/db/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";
import { Run, RunStatus } from "../models/run.model";

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

  async updateRun(run: PartialWithRequired<Run, "id">) {
    return await this.save(run);
  }

  async getRunById(id: string) {
    return await this.findOne({ where: { id } });
  }

  async getUserRun(id: string, userId: string) {
    return await this.findOne({ where: { id, userId } });
  }

  async getUserCompletedRuns(userId: string) {
    return await this.find({
      where: { userId, status: RunStatus.COMPLETED },
    });
  }
}

export const runRepo = new RunRepo();
