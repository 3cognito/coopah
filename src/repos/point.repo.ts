import { Repository } from "typeorm";
import { AppDataSource } from "../packages/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";
import { Point } from "../models/point.model";

type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export class PointRepo extends Repository<Point> {
  constructor() {
    super(Point, AppDataSource.manager);
  }

  async savePoint(pt: Partial<Point>) {
    const { ok, errors } = await validateEntity(pt);
    if (ok) {
      const newRun = await this.save(this.create(pt));
      return newRun;
    }
    throw new ValidationError(errors.join(" "));
  }

  async getRunPoints(run_id: string) {
    const pts = await this.find({ where: { run_id } });
    return pts;
  }
}

export const pointRepo = new PointRepo();
