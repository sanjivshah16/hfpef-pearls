import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("content.getDeletedItems", () => {
  it("returns deleted items for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public endpoint
    const result = await caller.content.getDeletedItems();
    
    // Result should be an array (may be empty)
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("content.getTweetEdits", () => {
  it("returns tweet edits for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public endpoint
    const result = await caller.content.getTweetEdits();
    
    // Result should be an array (may be empty)
    expect(Array.isArray(result)).toBe(true);
  });
});
