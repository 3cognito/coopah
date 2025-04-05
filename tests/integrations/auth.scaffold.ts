import { makeRequest } from "../../src/utils/request";
import { REGISTER_PATH } from "../base";

export function fail(message: string): void {
  throw new Error(message);
}

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
}

export function generateUser() {
  return {
    email: generateRandomEmail(),
    firstname: "John",
    lastname: "Doe",
    password: "password123",
  };
}

export async function registerUser() {
  const userData = generateUser();
  const res = await makeRequest("POST", REGISTER_PATH, userData);
  return { ok: res.ok, userData };
}
