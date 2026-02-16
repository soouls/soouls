import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create tRPC context with Clerk auth
export function createContext(opts?: { userId?: string; authToken?: string }) {
  return {
    userId: opts?.userId,
    authToken: opts?.authToken,
    // Add your context here (db, etc.)
  };
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<TrpcContext>().create();

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
    },
  });
});

export type EntriesApi = {
  createEntry: (userId: string, content: string, type?: 'entry' | 'task') => Promise<unknown>;
  getGalaxyData: (userId: string) => Promise<GalaxyData>;
};

export type TasksApi = {
  convertToTask: (entryId: string, deadline: Date) => Promise<unknown>;
};

export type GalaxyData = Array<{
  id: string;
  content: string;
  type: 'entry' | 'task';
  sentimentColor: string | null;
  sentimentLabel: string | null;
  x: number;
  y: number;
  z: number;
  visualMass: number;
}>;

export function createAppRouter(services: { entries: EntriesApi; tasks: TasksApi }) {
  return router({
    hello: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
      };
    }),

    createEntry: protectedProcedure
      .input(
        z.object({
          content: z.string(),
          type: z.enum(['entry', 'task']).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return services.entries.createEntry(ctx.userId, input.content, input.type ?? 'entry');
      }),

    getGalaxyData: protectedProcedure.query(async ({ ctx }) => {
      return services.entries.getGalaxyData(ctx.userId);
    }),

    convertToTask: protectedProcedure
      .input(
        z.object({
          entryId: z.string(),
          deadline: z.string(), // ISO string
        }),
      )
      .mutation(async ({ input }) => {
        await services.tasks.convertToTask(input.entryId, new Date(input.deadline));
        return { success: true };
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
