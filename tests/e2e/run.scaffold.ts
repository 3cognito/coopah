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
  const coordinates = [37.7749, -122.4194];
  const response = await makeRequest(
    "POST",
    `${RUN_PATH}`,
    { coordinates },
    token
  );
  return (await response.json()) as any;
}

export async function completeRun(
  runId: string,
  authToken: string,
  finalCoords: number[]
) {
  await makeRequest(
    "PUT",
    `${RUN_PATH}`,
    { runId, coordinates: finalCoords },
    authToken
  );
}

export async function addPoint(
  runId: string,
  authToken: string,
  coords: number[]
) {
  await makeRequest(
    "POST",
    `${RUN_PATH}point`,
    { runId, coordinates: coords },
    authToken
  );
}
