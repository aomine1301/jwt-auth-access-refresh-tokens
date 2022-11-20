import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { compare } from "bcrypt";
import { log } from "console";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, "rt-jwt") {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req.cookies.refresh;
      },
      ignoreExpiration: false,
      secretOrKey: "refresh_token_secret",

      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refresh_token = req.cookies.refresh;
    const validUser = this.userService.findById(payload.userId);
    if (!validUser) return null;
    const isValidToken = compare(refresh_token, validUser.hashedToken);
    const { password, hashedToken, ...user } = validUser;
    const access_token = this.jwtService.sign(user, {
      expiresIn: "15m",
      secret: "access_token_secret",
    });
    if (isValidToken) {
      return access_token;
    }
    return null;
  }
}
