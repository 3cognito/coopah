import { User } from "../../models/user.model";
import { Configs, type IConfigs } from "../configs";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Configs.DB_HOST,
  port: Configs.DB_PORT,
  username: Configs.DB_USER,
  password: Configs.DB_PASSWORD,
  database: Configs.DB_NAME,
  entities: [User],
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
