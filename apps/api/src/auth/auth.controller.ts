import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema } from "@signup/shared";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("register")
  async register(@Body() body: unknown) {
    const input = RegisterSchema.parse(body);
    return this.auth.register(input);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const input = LoginSchema.parse(body);
    return this.auth.login(input);
  }
}
