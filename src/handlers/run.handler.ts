import { Context } from "koa";
import { handleError, JsonSuccess } from "../packages/response/response";
import { RunService, runService } from "../services/run.service";
import { AddPointDto, RunRequestDto } from "../dto/run.dto";
import { ValidationError } from "../errors";
import { DateRange, validateDateRange } from "../utils/date";
import { User } from "../models/user.model";

declare module "koa" {
  interface DefaultState {
    user: User;
  }
}

export class RunHandler {
  private readonly runService: RunService;
  constructor(runService: RunService) {
    this.runService = runService;
  }

  async create(ctx: Context) {
    const runDto = ctx.state.validatedBody as RunRequestDto;
    try {
      const data = await this.runService.createRun(
        ctx.state.user.id,
        runDto.coordinates
      );
      JsonSuccess(ctx, 201, data, "Run created successfully");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async addPoint(ctx: Context) {
    const runDto = ctx.state.validatedBody as AddPointDto;
    try {
      const data = await this.runService.addPoint(
        ctx.state.user.id,
        runDto.runId,
        runDto.coordinates
      );
      JsonSuccess(ctx, 200, data, "Point added successfully");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async completeRun(ctx: Context) {
    const runDto = ctx.state.validatedBody as AddPointDto;
    try {
      const data = await this.runService.completeRun(
        ctx.state.user.id,
        runDto.runId,
        runDto.coordinates
      );
      JsonSuccess(ctx, 200, data, "Run completed");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async getCompletedRuns(ctx: Context) {
    try {
      const data = await this.runService.getUserCompletedRuns(
        ctx.state.user.id
      );
      JsonSuccess(ctx, 200, data, "Runs fetched");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async getRun(ctx: Context) {
    const runId = ctx.params.id;
    try {
      if (!runId) throw new ValidationError("Invalid run id");
      const data = await this.runService.getRun(ctx.state.user.id, runId);
      JsonSuccess(ctx, 200, data, "Run fetched");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async getSummary(ctx: Context) {
    try {
      const dateRange = ctx.query as DateRange;
      const { isValid, errorMessage } = validateDateRange(dateRange);
      if (!isValid) return handleError(ctx, new ValidationError(errorMessage));
      const summary = await this.runService.getRunSummary(
        ctx.state.user.id,
        dateRange
      );
      const data = summary || undefined;
      JsonSuccess(ctx, 200, data, "Runs fetched");
    } catch (error) {
      handleError(ctx, error);
    }
  }
}

export const runHandler = new RunHandler(runService);
