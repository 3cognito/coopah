import { QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../packages/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";
import { Point } from "../models/point.model";

export class PointRepo extends Repository<Point> {
  constructor() {
    super(Point, AppDataSource.manager);
  }

  async addPoint(pt: Partial<Point>, trx?: QueryRunner) {
    const { ok, errors } = await validateEntity(pt);
    if (ok) {
      let newPt: Point;
      trx
        ? (newPt = await trx.manager.save(this.create(pt)))
        : (newPt = await this.save(this.create(pt)));
      return newPt;
    }
    throw new ValidationError(errors.join(" "));
  }

  async getRunPoints(run_id: string) {
    const pts = await this.find({
      where: { run_id },
      order: {
        timestamp: {
          direction: "DESC",
        },
      },
    });
    return pts;
  }
}

export const pointRepo = new PointRepo();
