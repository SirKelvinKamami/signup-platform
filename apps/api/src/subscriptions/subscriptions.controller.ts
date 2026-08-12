import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SubscriptionsService } from "./subscriptions.service";
import { Request } from "express";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private subs: SubscriptionsService) {}

  @Get("plans")
  getPlans() {
    return this.subs.getPlans();
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("current")
  getCurrent(@Req() req: Request) {
    const user = req.user as any;
    return this.subs.getCurrent(user.organizationId);
  }
}
