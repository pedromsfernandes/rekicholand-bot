import { db } from "./client";
import { messagesTable, rolesTable } from "./schema";
import { eq, and } from "drizzle-orm/expressions";

export const findRoleByName = async (name: string) => {
  return findOne(await db.select().from(rolesTable).where(eq(rolesTable.name, name)).limit(1));
};

export const findReactionRolesMessage = async (guildId: string) => {
  return findOne(
    await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.guild, guildId), eq(messagesTable.type, "reaction-roles")))
      .limit(1)
  );
};

export const findReactionRolesMessageByDiscordId = async (messageId: string) => {
  return findOne(
    await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.dId, messageId), eq(messagesTable.type, "reaction-roles")))
      .limit(1)
  );
};

export const findRolesByGuild = async (guildId: string) => {
  return db.select().from(rolesTable).where(eq(rolesTable.guild, guildId));
};

export const findRoleByEmoji = async (emojiName: string) => {
  return findOne(await db.select().from(rolesTable).where(eq(rolesTable.emoji, emojiName)));
};

const findOne = <T>(list: T[]) => {
  if (list.length !== 1) {
    return undefined;
  }

  return list[0];
};
