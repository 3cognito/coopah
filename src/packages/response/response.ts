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
  const formattedError = {
    message: error instanceof Error ? error.message : "An error occured",
    stack: error instanceof Error && error.stack ? error.stack : "",
    statusCode: error instanceof CustomException ? error.statusCode : 500,
  };
  console.error(error);
  JsonError(ctx, formattedError);
}

export function JsonError(
  ctx: Context,
  error: {
    message: string;
    stack: string;
    statusCode: number;
  }
) {
  ctx.status = error.statusCode;
  ctx.body = {
    ok: false,
    message: error.message || "An error occured",
    error: error.message,
  };
}
