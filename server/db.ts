import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, deletedItems, InsertDeletedItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Deleted Items Management ============

/**
 * Get all deleted items
 */
export async function getDeletedItems() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get deleted items: database not available");
    return [];
  }

  return await db.select().from(deletedItems);
}

/**
 * Delete a thread (mark it as deleted)
 */
export async function deleteThread(threadId: string, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(deletedItems).values({
    itemType: 'thread',
    threadId,
    tweetIndex: null,
    deletedBy: userId,
  });
}

/**
 * Delete a specific tweet within a thread
 */
export async function deleteTweet(threadId: string, tweetIndex: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(deletedItems).values({
    itemType: 'tweet',
    threadId,
    tweetIndex,
    deletedBy: userId,
  });
}

/**
 * Restore a deleted thread
 */
export async function restoreThread(threadId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(deletedItems).where(
    and(
      eq(deletedItems.threadId, threadId),
      eq(deletedItems.itemType, 'thread')
    )
  );
}

/**
 * Restore a deleted tweet
 */
export async function restoreTweet(threadId: string, tweetIndex: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(deletedItems).where(
    and(
      eq(deletedItems.threadId, threadId),
      eq(deletedItems.tweetIndex, tweetIndex)
    )
  );
}

/**
 * Check if a thread is deleted
 */
export async function isThreadDeleted(threadId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select()
    .from(deletedItems)
    .where(
      and(
        eq(deletedItems.threadId, threadId),
        eq(deletedItems.itemType, 'thread')
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get deleted tweet indices for a thread
 */
export async function getDeletedTweetIndices(threadId: string): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select()
    .from(deletedItems)
    .where(
      and(
        eq(deletedItems.threadId, threadId),
        eq(deletedItems.itemType, 'tweet')
      )
    );

  return result
    .filter(item => item.tweetIndex !== null)
    .map(item => item.tweetIndex as number);
}
