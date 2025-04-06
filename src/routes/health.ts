import Router from "@koa/router";
import { JsonSuccess } from "../packages/response/response";

export const healthRoute = new Router({
  prefix: "/",
});

healthRoute.get("/", async (ctx) => {
  JsonSuccess(ctx, 200, {}, "app running..");
});
