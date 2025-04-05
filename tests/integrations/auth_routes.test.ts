import { LOGIN_PATH, REGISTER_PATH } from "../base";
import { describe, it, expect } from "@jest/globals";
import { makeRequest } from "../../src/utils/request";
import {
  registerUser,
  fail,
  generateUser,
  generateRandomEmail,
} from "./auth.scaffold";

describe("Test authentication routes", () => {
  describe("Registration endpoint", () => {
    it("should register a user with valid data", async () => {
      const userData = generateUser();

      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseJson.message).toBe("Account created successfully");
      expect(responseJson.data).toHaveProperty("user");
      expect(responseJson.data).toHaveProperty("token");
      expect(responseJson.data.user).toHaveProperty("id");
      expect(responseJson.data.user.email).toBe(userData.email);
      expect(responseJson.data.user.firstname).toBe(userData.firstname);
      expect(responseJson.data.user.lastname).toBe(userData.lastname);
      expect(responseJson.data.user.password).toBeFalsy();
    });

    it("should fail with invalid email format", async () => {
      const userData = generateUser();
      userData.email = "invalid-email";
      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);

      expect(response.status).toBe(422);
    });

    it("should fail when firstname is missing", async () => {
      const userData = generateUser();
      userData.firstname = "";
      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);

      expect(response.status).toBe(422);
    });

    it("should fail when lastname is missing", async () => {
      const userData = generateUser();
      userData.lastname = "";
      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);

      expect(response.status).toBe(422);
    });

    // Password validation tests
    it("should fail when password is too short", async () => {
      const userData = generateUser();
      userData.password = "pass";
      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);

      expect(response.status).toBe(422);
    });

    it("should fail when password is too long", async () => {
      const userData = generateUser();
      userData.password = "passwordpasswordpasswordpassword";
      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);

      expect(response.status).toBe(422);
    });

    it("should fail when email is already registered", async () => {
      const { ok, userData } = await registerUser();
      if (!ok) {
        fail(
          "Failed to register the initial user for the duplicate email test"
        );
      }

      await makeRequest("POST", `${REGISTER_PATH}`, userData);

      const response = await makeRequest("POST", `${REGISTER_PATH}`, userData);
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(responseJson.message).toContain(
        "duplicate key value violates unique constraint"
      );
    });
  });

  describe("Login endpoint", () => {
    it("should login a registered user with correct credentials", async () => {
      const { ok, userData } = await registerUser();
      if (!ok) {
        fail("failed to register test user");
      }

      const response = await makeRequest("POST", `${LOGIN_PATH}`, {
        email: userData.email,
        password: userData.password,
      });
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.data.user.email).toBe(userData.email);
    });

    it("should fail to login a user with wrong password", async () => {
      const { ok, userData } = await registerUser();
      userData.password = "someotherpass";
      if (!ok) {
        fail("failed to register test user");
      }

      const response = await makeRequest("POST", `${LOGIN_PATH}`, {
        email: userData.email,
        password: userData.password,
      });

      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toBe("Invalid email or password");
    });

    it("should fail to login a user with inexistent email", async () => {
      const { ok, userData } = await registerUser();
      userData.email = generateRandomEmail();
      if (!ok) {
        fail("failed to register test user");
      }

      const response = await makeRequest("POST", `${LOGIN_PATH}`, {
        email: userData.email,
        password: userData.password,
      });
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toBe("Invalid email or password");
    });
  });
});
