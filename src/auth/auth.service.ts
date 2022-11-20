import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcrypt";
import { log } from "console";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) { }

  async login(user: LoginDto) {
    const validUser1 = this.userService.findByName(user.username);

    if (validUser1) {
      const { password, hashedToken, ...validUser } = validUser1;
      const compareHash = await compare(user.password, password);
      if (validUser && compareHash) {
        const { access_token, refresh_token } = await this.getTokens(validUser);
        this.userService.update(validUser.userId, {
          hashedToken: await hash(refresh_token, 5),
        });
        return { refresh_token, access_token };
      }
    }
    throw new UnauthorizedException();
  }
  async registration(user: LoginDto) {
    const hashedPassword = await hash(user.password, 5);
    const { password, ...validUser } = this.userService.create({
      ...user,
      password: hashedPassword,
    });
    const { access_token, refresh_token } = await this.getTokens(validUser);

    this.userService.update(validUser.userId, {
      hashedToken: await hash(refresh_token, 5),
    });
    return { refresh_token, access_token };
  }

  async getTokens(validUser) {
    const access_token = this.jwtService.sign(validUser, {
      expiresIn: "15m",
      secret: "access_token_secret",
    });
    const refresh_token = this.jwtService.sign(validUser, {
      expiresIn: "30d",
      secret: "refresh_token_secret",
    });
    return { access_token, refresh_token };
  }
}
