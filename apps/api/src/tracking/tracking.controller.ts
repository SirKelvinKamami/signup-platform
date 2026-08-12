import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Redirect,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TrackingService } from "./tracking.service";
import { Request } from "express";

@Controller()
export class TrackingController {
  constructor(private tracking: TrackingService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("links")
  createLink(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return this.tracking.createLink(user.organizationId, body);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("links")
  getLinks(@Req() req: Request) {
    const user = req.user as any;
    return this.tracking.getLinks(user.organizationId);
  }

  // Public redirect endpoint
  @Get("l/:shortCode")
  @Redirect()
  async redirect(@Param("shortCode") shortCode: string, @Req() req: Request) {
    const link = await this.tracking.recordClick(shortCode, {
      ip: req.ip,
      ua: req.headers["user-agent"],
      referer: req.headers["referer"],
    });

    const url = new URL(link.targetUrl);
    if (link.utmSource) url.searchParams.set("utm_source", link.utmSource);
    if (link.utmMedium) url.searchParams.set("utm_medium", link.utmMedium);
    if (link.utmCampaign) url.searchParams.set("utm_campaign", link.utmCampaign);
    if (link.utmTerm) url.searchParams.set("utm_term", link.utmTerm);
    if (link.utmContent) url.searchParams.set("utm_content", link.utmContent);

    return { url: url.toString(), statusCode: 302 };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("links/:id/analytics")
  getAnalytics(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    return this.tracking.getAnalytics(id, user.organizationId);
  }
}
