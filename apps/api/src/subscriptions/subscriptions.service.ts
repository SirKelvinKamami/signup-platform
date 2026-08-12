import { Injectable, Inject } from "@nestjs/common";
import { DB } from "../db/database.module";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(DB) private db: LibSQLDatabase<typeof schema>) {}

  async getCurrent(orgId: string) {
    const sub = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.organizationId, orgId))
      .get();

    if (!sub) return null;

    const plan = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, sub.planId))
      .get();

    return { ...sub, plan };
  }

  async getPlans() {
    return this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.active, true as any))
      .all();
  }
}
