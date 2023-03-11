import { pgTable, serial, varchar, InferModel } from "drizzle-orm/pg-core";

export const messagesTable = pgTable("message", {
  id: serial("id").primaryKey(),
  dId: varchar("dId").notNull(),
  type: varchar("type").notNull(),
  channel: varchar("channel").notNull(),
  guild: varchar("guild").notNull(),
});
export type Message = InferModel<typeof messagesTable>;
export const rolesTable = pgTable("role", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  dId: varchar("dId").notNull(),
  emoji: varchar("emoji").notNull(),
  guild: varchar("guild").notNull(),
});
export type Role = InferModel<typeof rolesTable>;
