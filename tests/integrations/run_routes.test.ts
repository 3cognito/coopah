import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  addPoint,
  completeRun,
  createTestRun,
  loginUser,
} from "./run.scaffold";
import { makeRequest } from "../../src/utils/request";
import { RUN_PATH } from "../base";
import { RunStatus } from "../../src/models/run.model";
import { fail } from "./auth.scaffold";

describe("Run Endpoints", () => {
  let authToken: any;

  beforeEach(async () => {
    let { ok, token } = await loginUser(true);
    if (!ok) {
      fail("failed to login test user");
    }
    authToken = token;
  });

  describe("Create Run endpoint", () => {
    it("should create a new run with valid coordinates", async () => {
      const coordinates = [40.7128, -74.006];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}`,
        { coordinates },
        authToken
      );

      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseJson.data).toHaveProperty("runId");
      expect(responseJson.data).toHaveProperty("userId");
      expect(responseJson.data).toHaveProperty("status", RunStatus.IN_PROGRESS);
      expect(responseJson.data).toHaveProperty("startTimestamp");
      expect(responseJson.data).toHaveProperty("lastCoordinates", coordinates);
      expect(responseJson.data).toHaveProperty("timeElapsed", 0);
      expect(responseJson.data).toHaveProperty("totalDistance", 0);
    });

    it("should fail to create a run with invalid latitude", async () => {
      const coordinates = [95, -74.006];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}`,
        { coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toContain("Latitude must be between");
    });

    it("should fail to create a run with invalid longitude", async () => {
      const coordinates = [40.7128, 200];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}`,
        { coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toContain("Longitude must be between");
    });

    it("should fail to create a run without authentication", async () => {
      const coordinates = [40.7128, -74.006];

      const response = await makeRequest("POST", `${RUN_PATH}`, {
        coordinates,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Add Point endpoint", () => {
    let runId: string;

    beforeEach(async () => {
      const runResponse = await createTestRun(authToken);
      runId = runResponse.data.runId;
    });

    it("should add a point to an existing run", async () => {
      const coordinates = [37.775349, -122.4194];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}point`,
        { runId, coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.message).toBe("Point added successfully");
      expect(responseJson.data).toHaveProperty("runId", runId);
      expect(responseJson.data).toHaveProperty("totalDistance");
      expect(responseJson.data.totalDistance).toBeGreaterThan(0);
    });

    it("should fail to add a point to a non-existent run", async () => {
      const fakeRunId = "00000000-0000-0000-0000-000000000000";
      const coordinates = [40.713, -74.0065];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}point`,
        { runId: fakeRunId, coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(responseJson.message).toBe("Run not found");
    });

    it("should fail to add a point with invalid coordinates", async () => {
      const coordinates = [95, -74.0065];

      const response = await makeRequest(
        "POST",
        `${RUN_PATH}point`,
        { runId, coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toContain("Latitude must be between");
    });
  });

  describe("Complete Run endpoint", () => {
    let runId: string;

    beforeEach(async () => {
      const runResponse = await createTestRun(authToken);
      runId = runResponse.data.runId;

      //   // Add at least one point to make a valid run
      //   const pointCoordinates = [40.713, -74.0065];
      //   await makeRequest(
      //     "POST",
      //     `${RUN_PATH}/point`,
      //     { runId, coordinates: pointCoordinates },
      //     authToken
      //   );
    });

    it("should complete an existing run", async () => {
      const coordinates = [40.7135, -74.007];
      const response = await makeRequest(
        "PUT",
        `${RUN_PATH}`,
        { runId, coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.message).toBe("Run completed");
      expect(responseJson.data).toHaveProperty("status", RunStatus.COMPLETED);
      expect(responseJson.data).toHaveProperty("pace");
      expect(responseJson.data).toHaveProperty("speed");
      expect(responseJson.data).toHaveProperty("totalDistance");
      expect(responseJson.data).toHaveProperty("timeElapsed");
    });

    it("should fail to complete a non-existent run", async () => {
      const fakeRunId = "00000000-0000-0000-0000-000000000000";
      const coordinates = [40.7135, -74.007];

      const response = await makeRequest(
        "PUT",
        `${RUN_PATH}`,
        { runId: fakeRunId, coordinates },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(responseJson.message).toBe("Run not found");
    });

    it("should fail to complete an already completed run", async () => {
      const coordinates = [40.7135, -74.007];

      await completeRun(runId, authToken, coordinates);
      // Try to complete it again
      const response = await makeRequest(
        "PUT",
        `${RUN_PATH}`,
        { runId, coordinates: [40.714, -74.0075] },
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toBe("Run already completed");
    });
  });

  describe("Get Completed Runs endpoint", () => {
    let completedRunId: string;

    beforeEach(async () => {
      const runResponse = await createTestRun(authToken);
      completedRunId = runResponse.data.runId;
      const finalCoordinates = [40.7135, -74.007];
      await completeRun(completedRunId, authToken, finalCoordinates);
    });

    it("should return user's completed runs", async () => {
      const response = await makeRequest(
        "GET",
        `${RUN_PATH}user`,
        undefined,
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.message).toBe("Runs fetched");
      expect(Array.isArray(responseJson.data)).toBe(true);
      expect(responseJson.data.length).toBe(1);

      const foundRun = responseJson.data.find(
        (run: any) => run.id === completedRunId
      );
      expect(foundRun).toBeDefined();
      expect(foundRun.status).toBe(RunStatus.COMPLETED);
    });

    it("should return an empty array for a user with no completed runs", async () => {
      const { token } = await loginUser(true);

      const response = await makeRequest(
        "GET",
        `${RUN_PATH}user`,
        undefined,
        token
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.message).toBe("Runs fetched");
      expect(Array.isArray(responseJson.data)).toBe(true);
      expect(responseJson.data.length).toBe(0);
    });
  });

  describe("Get Run Details endpoint", () => {
    let completedRunId: string;

    beforeEach(async () => {
      const runResponse = await createTestRun(authToken);
      completedRunId = runResponse.data.runId;

      const points = [
        [40.713, -74.0065],
        [40.7132, -74.0068],
        [40.7134, -74.0072],
      ];

      for (const point of points) {
        await addPoint(completedRunId, authToken, point);
      }

      await completeRun(completedRunId, authToken, [40.7135, -74.0075]);
    });

    it("should get details for a specific run", async () => {
      const response = await makeRequest(
        "GET",
        `${RUN_PATH}${completedRunId}`,
        undefined,
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseJson.message).toBe("Run fetched");
      expect(responseJson.data).toHaveProperty("run");
      expect(responseJson.data).toHaveProperty("points");
      expect(responseJson.data.run).toHaveProperty("runId", completedRunId);
      expect(responseJson.data.run).toHaveProperty("status");
      expect(Array.isArray(responseJson.data.points)).toBe(true);
      expect(responseJson.data.points.length).toBeGreaterThan(1);
    });

    it("should fail to get a non-existent run", async () => {
      const fakeRunId = "00000000-0000-0000-0000-000000000000";

      const response = await makeRequest(
        "GET",
        `${RUN_PATH}${fakeRunId}`,
        undefined,
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toBe("Run not found");
    });

    it("should fail to get a run that belongs to another user", async () => {
      const { token } = await loginUser(true);

      const response = await makeRequest(
        "GET",
        `${RUN_PATH}${completedRunId}`,
        undefined,
        token
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(responseJson.message).toBe("Run not found");
    });

    it("should fail to get a run with insufficient points", async () => {
      const newRunResponse = await createTestRun(authToken);
      const newRunId = newRunResponse.data.runId;

      const response = await makeRequest(
        "GET",
        `${RUN_PATH}${newRunId}`,
        undefined,
        authToken
      );
      const responseJson = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseJson.message).toContain("incomplete");
    });
  });
});
