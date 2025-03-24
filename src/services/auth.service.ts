import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { NotFoundError } from "../errors";
import { Configs } from "../packages/configs";
import { userRepo, UserRepo } from "../repos/user.repo";
import jwt from "jsonwebtoken";

export class AuthService {
  private readonly userRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  async register(data: RegisterDto) {
    const user = await this.userRepo.createUser(data);
    const token = await this.signJwt(user.id);
    return { user, token };
  }

  async login(data: LoginDto) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) throw new NotFoundError("Account not found");
    const token = await this.signJwt(user.id);
    return { user, token };
  }

  async signJwt(userID: string): Promise<string> {
    const token = jwt.sign({ id: userID }, Configs.APP_SECRET, {
      expiresIn: Configs.JWT_EXPIRES_SECONDS,
    });
    return token;
  }
}

export const authService = new AuthService(userRepo);
