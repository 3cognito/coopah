import { makeRequest } from "../../src/utils/request";
import { LOGIN_PATH, RUN_PATH } from "../base";
import { registerUser } from "./auth.scaffold";

export async function loginUser(
  newUser: boolean = false,
  credentials?: { email: string; password: string }
) {
  if (newUser) {
    const { ok, userData, response } = await registerUser();
    return { ok, userData, token: response.data.token };
  }

  if (!credentials) {
    return { ok: false, userData: {}, token: "" };
  }

  const res = await makeRequest("POST", LOGIN_PATH, credentials);
  const responseJson = (await res.json()) as any;

  return {
    ok: res.ok,
    userData: responseJson.data.user,
    token: responseJson.data.token,
  };
}

export async function createTestRun(token: string) {
  const coordinates = [40.7128, -74.006]; // Example coordinates (NYC)
  const response = await makeRequest(
    "POST",
    `${RUN_PATH}/`,
    { coordinates },
    token
  );
  return await response.json();
}
