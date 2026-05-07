import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "tipster", "admin"]);
export const tierEnum = pgEnum("tier", ["BRONZE", "SILVER", "GOLD"]);
export const payoutPreferenceEnum = pgEnum("payout_preference", ["mtn", "airtel"]);
export const tipTypeEnum = pgEnum("tip_type", ["single", "accumulator"]);
export const tipStatusEnum = pgEnum("tip_status", ["pending", "won", "lost", "void", "postponed"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["tipster", "platform_vip"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["subscription", "payout", "refund"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "successful", "failed"]);
export const notificationTypeEnum = pgEnum("notification_type", ["new_tip", "result_update", "subscription", "payout", "announcement"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const betStatusEnum = pgEnum("bet_status", ["pending", "won", "lost", "void"]);
export const articleCategoryEnum = pgEnum("article_category", ["beginner", "strategy", "how-to", "tools"]);
export const languageEnum = pgEnum("language", ["en", "lg"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  username: varchar("username", { length: 50 }).unique(),
  fullName: varchar("full_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  isVip: boolean("is_vip").default(false).notNull(),
  vipExpiresAt: timestamp("vip_expires_at"),
  practiceCredits: integer("practice_credits").default(100000).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tipster profiles
export const tipsterProfiles = pgTable("tipster_profiles", {
  id: integer("id").primaryKey().references(() => users.id),
  bio: text("bio"),
  sports: jsonb("sports").$type<string[]>(),
  tier: tierEnum("tier").default("BRONZE").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  totalTips: integer("total_tips").default(0).notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  followerCount: integer("follower_count").default(0).notNull(),
  subscriberCount: integer("subscriber_count").default(0).notNull(),
  subscriptionPrice: integer("subscription_price").default(10000).notNull(),
  mtnMomoNumber: varchar("mtn_momo_number", { length: 20 }),
  airtelMoneyNumber: varchar("airtel_money_number", { length: 20 }),
  payoutPreference: payoutPreferenceEnum("payout_preference").default("mtn").notNull(),
  totalEarnings: integer("total_earnings").default(0).notNull(),
  pendingPayout: integer("pending_payout").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TipsterProfile = typeof tipsterProfiles.$inferSelect;
export type InsertTipsterProfile = typeof tipsterProfiles.$inferInsert;

// Tips
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  tipsterId: integer("tipster_id").notNull().references(() => users.id),
  matchName: varchar("match_name", { length: 255 }).notNull(),
  league: varchar("league", { length: 50 }).notNull(),
  matchDatetime: timestamp("match_datetime").notNull(),
  pick: varchar("pick", { length: 255 }).notNull(),
  odds: numeric("odds", { precision: 6, scale: 2 }).notNull(),
  stakeAdvice: varchar("stake_advice", { length: 50 }),
  analysis: text("analysis"),
  confidence: integer("confidence"),
  isFree: boolean("is_free").default(false).notNull(),
  tipType: tipTypeEnum("tip_type").default("single").notNull(),
  status: tipStatusEnum("status").default("pending").notNull(),
  resultUpdatedAt: timestamp("result_updated_at"),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Tip = typeof tips.$inferSelect;
export type InsertTip = typeof tips.$inferInsert;

// Follows
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  tipsterId: integer("tipster_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => users.id),
  tipsterId: integer("tipster_id").references(() => users.id),
  plan: subscriptionPlanEnum("plan").notNull(),
  amount: integer("amount").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  flutterwaveTxRef: varchar("flutterwave_tx_ref", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("UGX").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // Simplified from enum to varchar for flexibility
  phoneNumber: varchar("phone_number", { length: 20 }),
  flutterwaveTxRef: varchar("flutterwave_tx_ref", { length: 255 }),
  flutterwaveTxId: varchar("flutterwave_tx_id", { length: 255 }),
  status: transactionStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Practice Bets
export const practiceBets = pgTable("practice_bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tipId: integer("tip_id").notNull().references(() => tips.id),
  stake: integer("stake").notNull(),
  potentialReturn: integer("potential_return"),
  status: betStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: notificationTypeEnum("type").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: varchar("action_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tipster Applications
export const tipsterApplications = pgTable("tipster_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  sports: jsonb("sports").$type<string[]>(),
  experienceDescription: text("experience_description"),
  sampleTips: text("sample_tips"),
  socialLinks: jsonb("social_links").$type<{ facebook?: string; twitter?: string; whatsappGroup?: string }>(),
  status: applicationStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learn Articles
export const learnArticles = pgTable("learn_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: articleCategoryEnum("category").notNull(),
  language: languageEnum("language").default("en").notNull(),
  readTimeMinutes: integer("read_time_minutes"),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform Settings
export const platformSettings = pgTable("platform_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
