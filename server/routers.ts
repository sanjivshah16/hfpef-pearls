import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getDeletedItems,
  deleteThread,
  deleteTweet,
  restoreThread,
  restoreTweet,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin routes for managing content
  admin: router({
    // Get all deleted items
    getDeletedItems: adminProcedure.query(async () => {
      const items = await getDeletedItems();
      return items;
    }),

    // Delete an entire thread
    deleteThread: adminProcedure
      .input(z.object({ threadId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deleteThread(input.threadId, ctx.user.id);
        return { success: true };
      }),

    // Delete a specific tweet within a thread
    deleteTweet: adminProcedure
      .input(z.object({ 
        threadId: z.string(), 
        tweetIndex: z.number() 
      }))
      .mutation(async ({ input, ctx }) => {
        await deleteTweet(input.threadId, input.tweetIndex, ctx.user.id);
        return { success: true };
      }),

    // Restore a deleted thread
    restoreThread: adminProcedure
      .input(z.object({ threadId: z.string() }))
      .mutation(async ({ input }) => {
        await restoreThread(input.threadId);
        return { success: true };
      }),

    // Restore a deleted tweet
    restoreTweet: adminProcedure
      .input(z.object({ 
        threadId: z.string(), 
        tweetIndex: z.number() 
      }))
      .mutation(async ({ input }) => {
        await restoreTweet(input.threadId, input.tweetIndex);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
