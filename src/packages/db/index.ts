import { Point } from "../../models/point.model";
import { Run } from "../../models/run.model";
import { User } from "../../models/user.model";
import { Configs, type IConfigs } from "../configs";
import { DataSource, QueryRunner } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Configs.DB_HOST,
  port: Configs.DB_PORT,
  username: Configs.DB_USER,
  password: Configs.DB_PASSWORD,
  database: Configs.DB_NAME,
  entities: [User, Run, Point],
  synchronize: true,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("Database has been initialized!");
  } catch (e) {
    console.error("Error during Database initialization", e);
    process.exit(1);
  }
}

export async function startTransaction() {
  const newRunner = AppDataSource.createQueryRunner();
  await newRunner.connect();
  await newRunner.startTransaction();
  return newRunner;
}

export async function commitTransaction(runner: QueryRunner) {
  return await runner.commitTransaction();
}

export async function rollbackTransaction(runner: QueryRunner) {
  return await runner.rollbackTransaction();
}

export async function releaseRunner(runner: QueryRunner) {
  return await runner.release();
}
