import { Injectable, Inject } from "@nestjs/common";
import { DB } from "../db/database.module";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private db: LibSQLDatabase<typeof schema>) {}

  async getProfile(userId: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) return null;

    const org = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, user.organizationId))
      .get();

    return { ...user, passwordHash: undefined, organization: org };
  }
}
