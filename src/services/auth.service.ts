import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { User } from "../models/user.model";
import { Configs } from "../packages/configs";
import { UserRepo } from "../repos/user.repo";
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
    // const user =
  }

  async signJwt(userID: string): Promise<string> {
    const token = jwt.sign({ id: userID }, Configs.APP_SECRET, {
      expiresIn: "1h",
    });
    //store in redis
    return token;
  }
}
