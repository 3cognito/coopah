import Router from "@koa/router";
import { authHandler } from "../handlers/auth.handler";
import { validationMiddleware } from "../middlewares/validation";
import { LoginDto, RegisterDto } from "../dto/auth.dto";

export const authRouter = new Router({
  prefix: "/auth",
});

authRouter.post("/register", validationMiddleware(RegisterDto), async (ctx) => {
  await authHandler.register(ctx);
});

authRouter.post("/login", validationMiddleware(LoginDto), async (ctx) => {
  await authHandler.login(ctx);
});
