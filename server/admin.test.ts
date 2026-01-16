import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getDeletedItems: vi.fn().mockResolvedValue([]),
  deleteThread: vi.fn().mockResolvedValue(undefined),
  deleteTweet: vi.fn().mockResolvedValue(undefined),
  restoreThread: vi.fn().mockResolvedValue(undefined),
  restoreTweet: vi.fn().mockResolvedValue(undefined),
  getAllTweetEdits: vi.fn().mockResolvedValue([]),
  saveTweetEdit: vi.fn().mockResolvedValue(undefined),
  deleteTweetEdit: vi.fn().mockResolvedValue(undefined),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("admin.deleteThread", () => {
  it("allows admin to delete a thread", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteThread({ threadId: "thread-123" });

    expect(result).toEqual({ success: true });
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.deleteThread({ threadId: "thread-123" })
    ).rejects.toThrow();
  });
});

describe("admin.deleteTweet", () => {
  it("allows admin to delete a tweet", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteTweet({ 
      threadId: "thread-123", 
      tweetIndex: 0 
    });

    expect(result).toEqual({ success: true });
  });
});

describe("admin.saveTweetEdit", () => {
  it("allows admin to save tweet edits", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.saveTweetEdit({
      threadId: "thread-123",
      tweetIndex: 0,
      editedText: "Updated text",
      hiddenMedia: null,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("favorites.add", () => {
  it("allows authenticated user to add favorite", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.add({ threadId: "thread-123" });

    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorites.add({ threadId: "thread-123" })
    ).rejects.toThrow();
  });
});

describe("favorites.remove", () => {
  it("allows authenticated user to remove favorite", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.remove({ threadId: "thread-123" });

    expect(result).toEqual({ success: true });
  });
});

describe("favorites.list", () => {
  it("returns user favorites", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.list();

    expect(Array.isArray(result)).toBe(true);
  });
});
