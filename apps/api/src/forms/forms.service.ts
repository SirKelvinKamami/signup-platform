import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DB } from "../db/database.module";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";

@Injectable()
export class FormsService {
  constructor(@Inject(DB) private db: LibSQLDatabase<typeof schema>) {}

  async create(orgId: string, data: { title: string; description?: string; schema: string; settings?: string }) {
    const id = nanoid();
    await this.db.insert(schema.forms).values({
      id,
      organizationId: orgId,
      ...data,
    });
    return this.findById(id);
  }

  async findAll(orgId: string) {
    return this.db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.organizationId, orgId))
      .all();
  }

  async findById(id: string) {
    const form = await this.db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.id, id))
      .get();
    if (!form) throw new NotFoundException("Form not found");
    return form;
  }

  async update(id: string, data: Partial<{ title: string; description: string; schema: string; settings: string; published: boolean }>) {
    await this.db
      .update(schema.forms)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.forms.id, id))
      .run();
    return this.findById(id);
  }

  async delete(id: string) {
    await this.db.delete(schema.forms).where(eq(schema.forms.id, id)).run();
  }

  async submit(formId: string, data: string, metadata?: string) {
    const id = nanoid();
    await this.db.insert(schema.submissions).values({ id, formId, data, metadata });
    return this.db.select().from(schema.submissions).where(eq(schema.submissions.id, id)).get();
  }

  async getSubmissions(formId: string, orgId: string) {
    const form = await this.findById(formId);
    if (form.organizationId !== orgId) throw new NotFoundException();
    return this.db
      .select()
      .from(schema.submissions)
      .where(eq(schema.submissions.formId, formId))
      .all();
  }
}
