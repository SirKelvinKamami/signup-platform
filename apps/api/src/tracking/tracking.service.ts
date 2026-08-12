import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DB } from "../db/database.module";
import * as schema from "../db/schema";
import { eq, sql, count } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import * as UAParser from "ua-parser-js";

@Injectable()
export class TrackingService {
  constructor(@Inject(DB) private db: LibSQLDatabase<typeof schema>) {}

  async createLink(
    orgId: string,
    data: {
      title: string;
      targetUrl: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmTerm?: string;
      utmContent?: string;
    }
  ) {
    const id = nanoid();
    const shortCode = nanoid(8);
    await this.db.insert(schema.links).values({
      id,
      organizationId: orgId,
      shortCode,
      targetUrl: data.targetUrl,
      title: data.title,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      utmTerm: data.utmTerm || null,
      utmContent: data.utmContent || null,
    });
    return this.db.select().from(schema.links).where(eq(schema.links.id, id)).get();
  }

  async getLinks(orgId: string) {
    return this.db
      .select()
      .from(schema.links)
      .where(eq(schema.links.organizationId, orgId))
      .all();
  }

  async getLink(shortCode: string) {
    const link = await this.db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortCode, shortCode))
      .get();
    if (!link) throw new NotFoundException("Link not found");
    return link;
  }

  async recordClick(shortCode: string, req: { ip?: string; ua?: string; referer?: string }) {
    const link = await this.getLink(shortCode);

    let deviceType: string | null = null;
    let browser: string | null = null;
    let os: string | null = null;

    if (req.ua) {
      const parser = new UAParser.UAParser(req.ua);
      const result = parser.getResult();
      deviceType = result.device.type || "desktop";
      browser = result.browser.name || null;
      os = result.os.name || null;
    }

    await this.db.insert(schema.clickEvents).values({
      id: nanoid(),
      linkId: link.id,
      ipAddress: req.ip || null,
      userAgent: req.ua || null,
      referer: req.referer || null,
      country: null,
      deviceType,
      browser,
      os,
    });

    return link;
  }

  async getAnalytics(linkId: string, orgId: string) {
    const link = await this.db
      .select()
      .from(schema.links)
      .where(eq(schema.links.id, linkId))
      .get();

    if (!link || link.organizationId !== orgId) {
      throw new NotFoundException("Link not found");
    }

    const events = await this.db
      .select()
      .from(schema.clickEvents)
      .where(eq(schema.clickEvents.linkId, linkId))
      .all();

    const totalClicks = events.length;

    const clicksByDate = this.groupBy(
      events,
      (e) => e.createdAt.split("T")[0]
    );

    const clicksBySource = this.groupBy(events, (e) => e.browser || "unknown");
    const clicksByMedium = this.groupBy(events, (e) => e.os || "unknown");
    const clicksByDevice = this.groupBy(
      events,
      (e) => e.deviceType || "unknown"
    );

    return {
      totalClicks,
      clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
        date,
        count,
      })),
      clicksBySource: Object.entries(clicksBySource).map(
        ([source, count]) => ({ source, count })
      ),
      clicksByMedium: Object.entries(clicksByMedium).map(([medium, count]) => ({
        medium,
        count,
      })),
      clicksByDevice: Object.entries(clicksByDevice).map(
        ([device, count]) => ({ device, count })
      ),
    };
  }

  private groupBy(items: any[], keyFn: (item: any) => string) {
    return items.reduce(
      (acc, item) => {
        const key = keyFn(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}
