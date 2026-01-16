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
  getAllTweetEdits,
  saveTweetEdit,
  deleteTweetEdit,
  getUserFavorites,
  addFavorite,
  removeFavorite,
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

  // Public routes for content (edits visible to all users)
  content: router({
    // Get all deleted items (public - so all users see edited content)
    getDeletedItems: publicProcedure.query(async () => {
      const items = await getDeletedItems();
      return items;
    }),

    // Get all tweet edits (public - so all users see edited content)
    getTweetEdits: publicProcedure.query(async () => {
      const edits = await getAllTweetEdits();
      return edits;
    }),
  }),

  // Admin routes for managing content
  admin: router({

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

    // Save tweet edit (text and/or hidden media)
    saveTweetEdit: adminProcedure
      .input(z.object({
        threadId: z.string(),
        tweetIndex: z.number(),
        editedText: z.string().nullable(),
        hiddenMedia: z.array(z.string()).nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        await saveTweetEdit(
          input.threadId,
          input.tweetIndex,
          input.editedText,
          input.hiddenMedia,
          ctx.user.id
        );
        return { success: true };
      }),

    // Delete tweet edit (restore to original)
    deleteTweetEdit: adminProcedure
      .input(z.object({
        threadId: z.string(),
        tweetIndex: z.number(),
      }))
      .mutation(async ({ input }) => {
        await deleteTweetEdit(input.threadId, input.tweetIndex);
        return { success: true };
      }),
  }),

  // User favorites routes
  favorites: router({
    // Get user's favorites
    list: protectedProcedure.query(async ({ ctx }) => {
      const favorites = await getUserFavorites(ctx.user.id);
      return favorites.map(f => f.threadId);
    }),

    // Add to favorites
    add: protectedProcedure
      .input(z.object({ threadId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await addFavorite(ctx.user.id, input.threadId);
        return { success: true };
      }),

    // Remove from favorites
    remove: protectedProcedure
      .input(z.object({ threadId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeFavorite(ctx.user.id, input.threadId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
