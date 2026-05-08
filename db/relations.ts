import { relations } from "drizzle-orm";
import {
  users,
  tipsterProfiles,
  tips,
  follows,
  subscriptions,
  transactions,
  practiceBets,
  notifications,
  tipsterApplications,
} from "./schema.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  tipsterProfile: one(tipsterProfiles, {
    fields: [users.id],
    references: [tipsterProfiles.id],
  }),
  tips: many(tips),
  follows: many(follows),
  subscriptions: many(subscriptions),
  transactions: many(transactions),
  practiceBets: many(practiceBets),
  notifications: many(notifications),
}));

export const tipsterProfilesRelations = relations(tipsterProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tipsterProfiles.id],
    references: [users.id],
  }),
}));

export const tipsRelations = relations(tips, ({ one }) => ({
  tipster: one(users, {
    fields: [tips.tipsterId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
  }),
  tipster: one(users, {
    fields: [follows.tipsterId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.id],
  }),
  tipster: one(users, {
    fields: [subscriptions.tipsterId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const practiceBetsRelations = relations(practiceBets, ({ one }) => ({
  user: one(users, {
    fields: [practiceBets.userId],
    references: [users.id],
  }),
  tip: one(tips, {
    fields: [practiceBets.tipId],
    references: [tips.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const tipsterApplicationsRelations = relations(tipsterApplications, ({ one }) => ({
  user: one(users, {
    fields: [tipsterApplications.userId],
    references: [users.id],
  }),
}));
