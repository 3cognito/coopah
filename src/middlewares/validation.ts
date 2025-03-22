import { Context, Next } from "koa";
import { plainToInstance } from "class-transformer";
import { validateEntity } from "../utils/validator";
import { handleError } from "../packages/response/response";
import { ValidationError } from "../errors";

export function validationmiddleware<T extends object>(
  type: new () => T
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    const body = ctx.request.body;

    const dto = plainToInstance(type, body);
    const { ok, errors } = await validateEntity(dto);
    const errMsg = errors.join(", ");
    if (!ok) return handleError(ctx, new ValidationError(errMsg));
    ctx.state.validatedBody = dto;
    await next();
  };
}
