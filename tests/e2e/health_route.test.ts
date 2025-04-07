import { describe, it, expect } from "@jest/globals";
import { makeRequest } from "../../src/utils/request";
import { HEALTH_PATH } from "../base";

describe("Test health route", () => {
  it("app health path should return 200", async () => {
    const response = await makeRequest<{ status: number }>(
      "GET",
      `${HEALTH_PATH}/`
    );
    expect(response.status).toBe(200);
  });
});
