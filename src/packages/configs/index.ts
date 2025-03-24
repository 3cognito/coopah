import * as dotenv from "dotenv";
dotenv.config();

export interface IConfigs {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  PORT: number;
  APP_SECRET: string;
  JWT_EXPIRES_SECONDS: number;
}

export const Configs: IConfigs = {
  DB_HOST: process.env.DB_HOST!,
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_PORT: +process.env.DB_PORT!,
  PORT: +process.env.PORT!,
  APP_SECRET: process.env.APP_SECRET!,
  JWT_EXPIRES_SECONDS: +process.env.JWT_EXPIRES_SECONDS!,
};

export function validateConfigs() {
  try {
    for (const [key, value] of Object.entries(Configs)) {
      if (value === undefined || value === null) {
        throw new Error(`Configuration error: ${key} is undefined or null.`);
      }

      if (typeof value === "string" && value.trim() === "") {
        throw new Error(
          `Configuration error: ${key} cannot be an empty string.`
        );
      }

      console.log(value, typeof value, key);
      if (typeof value === "number" && isNaN(+value)) {
        throw new Error(`Configuration error: ${key} is an invalid number.`);
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error("Configuration validation failed:", e.message);
    } else {
      console.error("An unknown error occurred:", e);
    }
    process.exit(1);
  }
}
