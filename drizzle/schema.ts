import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Track deleted threads and tweets.
 * When an item is deleted, we store its ID here so it won't be shown.
 */
export const deletedItems = mysqlTable("deleted_items", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of item: 'thread' or 'tweet' */
  itemType: mysqlEnum("itemType", ["thread", "tweet"]).notNull(),
  /** The thread ID (conversation_id) */
  threadId: varchar("threadId", { length: 64 }).notNull(),
  /** For tweets, the index within the thread (0-based). Null for thread deletions. */
  tweetIndex: int("tweetIndex"),
  /** When the item was deleted */
  deletedAt: timestamp("deletedAt").defaultNow().notNull(),
  /** Who deleted it (user ID) */
  deletedBy: int("deletedBy"),
});

export type DeletedItem = typeof deletedItems.$inferSelect;
export type InsertDeletedItem = typeof deletedItems.$inferInsert;

/**
 * Track edits to tweet text and media.
 * Stores the edited version of tweet content.
 */
export const tweetEdits = mysqlTable("tweet_edits", {
  id: int("id").autoincrement().primaryKey(),
  /** The thread ID */
  threadId: varchar("threadId", { length: 64 }).notNull(),
  /** The tweet index within the thread (0-based) */
  tweetIndex: int("tweetIndex").notNull(),
  /** Edited tweet text (null means use original) */
  editedText: text("editedText"),
  /** JSON array of media URLs to hide (deleted media) */
  hiddenMedia: json("hiddenMedia").$type<string[]>(),
  /** When the edit was made */
  editedAt: timestamp("editedAt").defaultNow().notNull(),
  /** Who made the edit (user ID) */
  editedBy: int("editedBy"),
});

export type TweetEdit = typeof tweetEdits.$inferSelect;
export type InsertTweetEdit = typeof tweetEdits.$inferInsert;

/**
 * User favorites - bookmarked threads.
 */
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  /** User who favorited */
  userId: int("userId").notNull(),
  /** The thread ID that was favorited */
  threadId: varchar("threadId", { length: 64 }).notNull(),
  /** When it was favorited */
  favoritedAt: timestamp("favoritedAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;
