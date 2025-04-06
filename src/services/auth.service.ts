import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { BadRequestError, NotFoundError } from "../errors";
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
    const user = await this.userRepo.findByEmailWithPassword(data.email);
    if (!user || !user.isCorrectPassword(data.password)) {
      throw new BadRequestError("Invalid email or password");
    }
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
