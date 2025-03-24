import Router from "@koa/router";
import { authHandler } from "../handlers/auth.handler";
import { validationMiddleware } from "../middlewares/validation";
import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { RunRequestDto } from "../dto/run.dto";
import { runHandler } from "../handlers/run.handler";

export const authRouter = new Router({
  prefix: "/auth",
});

authRouter.post("/register", validationMiddleware(RegisterDto), async (ctx) => {
  await authHandler.register(ctx);
});

authRouter.post("/login", validationMiddleware(LoginDto), async (ctx) => {
  await authHandler.login(ctx);
});

export const runRouter = new Router({
  prefix: "/runs",
});

runRouter.post("/", validationMiddleware(RunRequestDto), async (ctx) => {
  await runHandler.create(ctx);
});

runRouter.put("/", validationMiddleware(RunRequestDto), async (ctx) => {
  await runHandler.completeRun(ctx);
});

runRouter.get("/:id", async (ctx) => {
  await runHandler.getRun(ctx);
});

runRouter.get("/user/", async (ctx) => {
  await runHandler.getCompletedRuns(ctx);
});

runRouter.post("/point/", async (ctx) => {
  await runHandler.addPoint(ctx);
});
