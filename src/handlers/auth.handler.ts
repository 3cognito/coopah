import { Context } from "koa";
import { authService, AuthService } from "../services/auth.service";
import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { handleError, JsonSuccess } from "../packages/response/response";

export class AuthHandler {
  private readonly authService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(ctx: Context) {
    const registerDto = ctx.state.validatedBody as RegisterDto;
    try {
      const data = await this.authService.register(registerDto);
      JsonSuccess(ctx, 201, data, "Account created successfully");
    } catch (error) {
      handleError(ctx, error);
    }
  }

  async login(ctx: Context) {
    const loginDto = ctx.state.validatedBody as LoginDto;
    try {
      const data = await this.authService.login(loginDto);
      JsonSuccess(ctx, 200, data, "login successful");
    } catch (error) {
      handleError(ctx, error);
    }
  }
}

export const authHandler = new AuthHandler(authService);
