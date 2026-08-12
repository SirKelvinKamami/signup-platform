import { z } from "zod";

// ─── Auth ──────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  organizationName: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Form Fields ────────────────────────────────────
export const FieldType = z.enum([
  "text",
  "email",
  "phone",
  "number",
  "textarea",
  "select",
  "multiselect",
  "checkbox",
  "radio",
  "date",
  "file",
  "signature",
]);

export type FieldType = z.infer<typeof FieldType>;

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FieldType,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  conditions: z
    .array(
      z.object({
        fieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains", "gt", "lt"]),
        value: z.string(),
      })
    )
    .optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const FormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  settings: z
    .object({
      submitLabel: z.string().default("Submit"),
      thankYouMessage: z.string().default("Thank you!"),
      redirectUrl: z.string().optional(),
      theme: z
        .object({
          primaryColor: z.string().default("#6366f1"),
          backgroundColor: z.string().default("#ffffff"),
          fontFamily: z.string().default("Inter"),
        })
        .optional(),
    })
    .optional(),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

// ─── Links / Tracking ────────────────────────────────
export const CreateLinkSchema = z.object({
  title: z.string().min(1),
  targetUrl: z.string().url(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export type CreateLinkInput = z.infer<typeof CreateLinkSchema>;

// ─── Analytics ──────────────────────────────────────
export type ClickEvent = {
  id: string;
  linkId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  createdAt: string;
};

export type LinkAnalytics = {
  totalClicks: number;
  clicksByDate: { date: string; count: number }[];
  clicksBySource: { source: string; count: number }[];
  clicksByMedium: { medium: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
};
