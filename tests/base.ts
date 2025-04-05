import { Configs } from "../src/packages/configs";

export const BASE_URL = `http://localhost:${Configs.PORT}/`;
export const HEALTH_PATH = BASE_URL;
export const AUTH_PATHS = BASE_URL + "auth/";
export const REGISTER_PATH = AUTH_PATHS + "register";
export const LOGIN_PATH = AUTH_PATHS + "login";
