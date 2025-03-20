import Router from "@koa/router";
import { authHandler } from "../handlers/auth.handler";

export const authRouter = new Router({
  prefix: "/auth",
});

authRouter.post("/register", authHandler.register);
authRouter.post("/login", authHandler.login);
