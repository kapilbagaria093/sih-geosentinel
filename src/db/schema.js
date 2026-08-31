import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  doublePrecision,
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