import { initTRPC } from "@trpc/server";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({
  sse: {
    client: {
      reconnectAfterInactivityMs: 180_000,
    },
  },
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
// export const router = t.router;
export const publicProcedure = t.procedure;
export const { createCallerFactory, router } = t;
