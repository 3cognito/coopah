import { Repository } from "typeorm";
import { User } from "../models/user.model";
import { AppDataSource } from "../packages/db/db";
import { validateEntity } from "../utils/validator";
import { ValidationError } from "../errors";

export class UserRepo extends Repository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async createUser(user: Partial<User>) {
    const { ok, errors } = await validateEntity(user);
    if (ok) {
      const newuser = await this.save(this.create(user));
      newuser.password = "";
      return newuser;
    }
    throw new ValidationError(errors.join(" "));
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.findOne({
      where: { email },
      select: ["id", "password", "firstname", "email", "lastname", "createdAt"],
    });
  }

  async findByID(id: string): Promise<User | null> {
    return await this.findOne({ where: { id } });
  }
}

export const userRepo = new UserRepo();
