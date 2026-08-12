import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FormsService } from "./forms.service";
import { Request } from "express";

@Controller("forms")
export class FormsController {
  constructor(private forms: FormsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return this.forms.create(user.organizationId, body);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.forms.findAll(user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.forms.findById(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.forms.update(id, body);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.forms.delete(id);
  }

  // Public submission endpoint (no auth)
  @Post(":id/submit")
  submit(@Param("id") id: string, @Body() body: any) {
    return this.forms.submit(
      id,
      JSON.stringify(body.data || {}),
      JSON.stringify(body.metadata || {})
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/submissions")
  getSubmissions(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    return this.forms.getSubmissions(id, user.organizationId);
  }
}
