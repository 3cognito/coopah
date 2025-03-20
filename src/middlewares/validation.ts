import { Context, Next } from "koa";
import { plainToInstance } from "class-transformer";
import { validateEntity } from "../utils/validator";
import { JsonError } from "../packages/response/response";
import { ValidationError } from "../errors";

export function validationmiddleware<T extends object>(
  type: new () => T
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    const body = ctx.request.body;

    const dto = plainToInstance(type, body);
    const { ok, errors } = await validateEntity(dto);
    const errMsg = errors.join(", ");
    if (ok) {
      ctx.state.validatedBody = dto;
      await next();
    }

    JsonError(ctx, 400, errMsg, new ValidationError(errMsg));
  };
}
