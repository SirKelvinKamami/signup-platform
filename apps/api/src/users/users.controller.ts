import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { Request } from "express";

@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.users.getProfile(user.id);
  }
}
