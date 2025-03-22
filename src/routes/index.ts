import Router from "@koa/router";
import { authHandler } from "../handlers/auth.handler";
import { validationmiddleware } from "../middlewares/validation";
import { LoginDto, RegisterDto } from "../dto/auth.dto";

export const authRouter = new Router({
  prefix: "/auth",
});

authRouter.post("/register", validationmiddleware(RegisterDto), async (ctx) => {
  await authHandler.register(ctx);
});

authRouter.post("/login", validationmiddleware(LoginDto), async (ctx) => {
  await authHandler.login(ctx);
});
