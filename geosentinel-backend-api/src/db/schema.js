import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),

    role: text("role").default("user").notNull(),

    phoneNumber: text("phone_number").notNull().unique(),

    phoneVerified: boolean("phone_verified")
      .notNull()
      .default(false),

    phoneVerificationCode: text("phone_verification_code"),

    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_phone_number_idx").on(table.phoneNumber),
  ]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    refreshToken: text("refresh_token")
      .notNull()
      .unique(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
  ]
);

export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    severity: text("severity").notNull(),

    description: text("description").notNull(),

    latitude: doublePrecision("latitude").notNull(),

    longitude: doublePrecision("longitude").notNull(),

    altitude: doublePrecision("altitude"),

    address: text("address"),

    reportedAt: timestamp("reported_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_user_id_idx").on(table.userId),
    index("report_reported_at_idx").on(table.reportedAt),
  ],
);

export const reportMedia = pgTable(
  "report_media",
  {
    id: text("id").primaryKey(),

    reportId: text("report_id")
      .notNull()
      .references(() => report.id, {
        onDelete: "cascade",
      }),

    kind: text("kind").notNull(),

    fileName: text("file_name").notNull(),

    mimeType: text("mime_type").notNull(),

    publicId: text("public_id").notNull(),

    resourceType: text("resource_type").notNull(),

    secureUrl: text("secure_url").notNull(),

    fileSize: integer("file_size"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_media_report_id_idx").on(table.reportId),
  ],
);