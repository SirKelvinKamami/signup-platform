import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ─── Organizations ──────────────────────────────────
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ─── Users ──────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  role: text("role").notNull().default("member"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ─── Forms ──────────────────────────────────────────
export const forms = sqliteTable("forms", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description"),
  schema: text("schema").notNull(), // JSON string of form fields
  settings: text("settings"), // JSON string of settings
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});

// ─── Submissions ────────────────────────────────────
export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  formId: text("form_id")
    .notNull()
    .references(() => forms.id),
  data: text("data").notNull(), // JSON string of submitted values
  metadata: text("metadata"), // JSON string of IP, UA, etc.
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ─── Links ──────────────────────────────────────────
export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  title: text("title").notNull(),
  targetUrl: text("target_url").notNull(),
  shortCode: text("short_code").unique().notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ─── Click Events ───────────────────────────────────
export const clickEvents = sqliteTable("click_events", {
  id: text("id").primaryKey(),
  linkId: text("link_id")
    .notNull()
    .references(() => links.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ─── Plans & Subscriptions ──────────────────────────
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // cents; 0 = free
  interval: text("interval").notNull().default("month"),
  features: text("features"), // JSON
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: text("status").notNull().default("active"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: text("current_period_start"),
  currentPeriodEnd: text("current_period_end"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});
