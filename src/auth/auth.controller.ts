import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AtJwtAuthGuard } from "./guard/at.guard";
import { RtJwtAuthGuard } from "./guard/rt.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) { }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Post("registration")
  async registration(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.registration(
      dto
    );
    res.cookie("refresh", refresh_token, { httpOnly: true });
    return access_token;
  }
  @UseGuards(AtJwtAuthGuard)
  @Get("profile")
  profile(@Req() req: any): any {
    const { password, hashedToken, ...user } = this.userService.findById(
      req.user.userId
    );
    return user;
  }
  @UseGuards(RtJwtAuthGuard)
  @Get("refresh")
  async refresh(@Req() req: Request) {
    return req.user;
  }
}
