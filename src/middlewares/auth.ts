import { Context, Next } from "koa";
import { handleError } from "../packages/response/response";
import { UnauthorizedError } from "../errors";
import jwt from "jsonwebtoken";
import { Configs } from "../packages/configs";
import { UserRepo } from "../repos/user.repo";

const userRepo = new UserRepo();

export async function CheckAuthToken(ctx: Context, next: Next): Promise<void> {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return handleError(
      ctx,
      new UnauthorizedError("No token provided, please login!")
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, Configs.APP_SECRET);
    if (typeof decoded !== "string" && decoded.id) {
      const user = await userRepo.findByID(decoded.id as string);
      if (!user) {
        return handleError(ctx, new UnauthorizedError("Account not found"));
      }
      ctx.state.user = user; //TODO: declaraiton merging to make user accessible from handlers.
      await next();
    } else {
      return handleError(ctx, new UnauthorizedError("Invalid token payload"));
    }
  } catch (error) {
    return handleError(ctx, new UnauthorizedError("Invalid token"));
  }
}
