import { Context } from "koa";
import { CustomException, InternalServerError } from "../../errors";

export function JsonSuccess(
  ctx: Context,
  statusCode: number,
  data: object = {},
  message: string
) {
  ctx.status = statusCode;
  ctx.body = { ok: true, message, data };
}

export function handleError(ctx: Context, error: unknown) {
  if (error instanceof CustomException) {
    JsonError(ctx, error);
  } else {
    console.error("Unknown error occurred:", error);
    JsonError(ctx, new InternalServerError());
  }
}

export function JsonError(ctx: Context, error: CustomException) {
  ctx.status = error.statusCode;
  console.error({
    request: ctx.request,
    statusCode: error.statusCode,
    message: error.message,
    error: error.message,
    stack: error.stack,
  });
  ctx.body = {
    ok: false,
    message: error.message || "An error occured",
    error: error.message,
  };
}
