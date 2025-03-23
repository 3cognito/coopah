import { Repository } from "typeorm";
import { User } from "../models/user.model";
import { AppDataSource } from "../packages/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";

export class UserRepo extends Repository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async createUser(user: Partial<User>) {
    const { ok, errors } = await validateEntity(user);
    if (ok) return await this.save(this.create(user));
    throw new ValidationError(errors.join(" "));
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }
}

export const userRepo = new UserRepo();
