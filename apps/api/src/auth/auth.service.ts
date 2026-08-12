import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DB } from "../db/database.module";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { hash, compare } from "bcryptjs";
import { nanoid } from "nanoid";
import { RegisterInput, LoginInput } from "@signup/shared";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: LibSQLDatabase<typeof schema>,
    private jwt: JwtService
  ) {}

  async register(input: RegisterInput) {
    const orgId = nanoid();
    const userId = nanoid();

    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, input.email))
      .get();

    if (existingUser) {
      throw new UnauthorizedException("Email already in use");
    }

    const passwordHash = await hash(input.password, 12);

    await this.db.batch([
      this.db.insert(schema.organizations).values({
        id: orgId,
        name: input.organizationName,
        slug: input.organizationName.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(6),
      }),
      this.db.insert(schema.users).values({
        id: userId,
        email: input.email,
        name: input.name,
        passwordHash,
        organizationId: orgId,
        role: "owner",
      }),
      this.db.insert(schema.plans).values({
        id: "free",
        name: "Free",
        price: 0,
        interval: "month",
        features: JSON.stringify({
          maxUsers: 1,
          maxForms: 5,
          maxLinks: 10,
          maxClicksPerMonth: 1000,
        }),
      }),
      this.db.insert(schema.subscriptions).values({
        id: nanoid(),
        organizationId: orgId,
        planId: "free",
        status: "active",
      }),
    ]);

    return this.generateTokens(userId, orgId);
  }

  async login(input: LoginInput) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, input.email))
      .get();

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user.id, user.organizationId);
  }

  private generateTokens(userId: string, orgId: string) {
    const payload = { sub: userId, orgId };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: "15m" }),
      refreshToken: this.jwt.sign(payload, { expiresIn: "7d" }),
    };
  }

  async validateUser(userId: string) {
    return this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();
  }
}
