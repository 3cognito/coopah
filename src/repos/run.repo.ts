import { Repository } from "typeorm";
import { AppDataSource } from "../packages/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";
import { Run, RunStatus } from "../models/run.model";

type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export class RunRepo extends Repository<Run> {
  constructor() {
    super(Run, AppDataSource.manager);
  }

  async createRun(run: Partial<Run>) {
    const { ok, errors } = await validateEntity(run);
    if (ok) {
      const newRun = await this.save(this.create(run));
      return newRun;
    }
    throw new ValidationError(errors.join(" "));
  }

  async updateRun(run: PartialWithRequired<Run, "id">) {
    return await this.save(run);
  }

  async getRun(id: string) {
    return await this.findOne({ where: { id } });
  }

  async getUserCompletedRuns(userID: string) {
    return await this.find({
      where: { userID, status: RunStatus.COMPLETED },
    });
  }
}

export const runRepo = new RunRepo();
