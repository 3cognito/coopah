import { Context } from "koa";
import { CustomException } from "../../errors";

export function JsonSuccess(
  ctx: Context,
  status: number,
  data: object = {},
  message: string
) {
  ctx.status = status;
  ctx.body = { ok: true, message, data };
}

export function JsonError(
  ctx: Context,
  status: number = 400,
  message: string = "An error occurred",
  error: CustomException
) {
  ctx.status = status;
  console.error({
    request: ctx.request,
    status,
    message,
    error: error.message,
    stack: error.stack,
  });
  ctx.body = {
    ok: false,
    message,
    error: error.message,
  };
}
