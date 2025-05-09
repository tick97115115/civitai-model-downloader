import { initTRPC } from "@trpc/server";
import { mediaRouter } from "./media";
import { modelFileRouter } from "./modelFile";
import { modelIdRouter } from "./modelId";
import { modelVersionRouter } from "./modelVersion";
import { settingsRouter } from "./settings";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
// export const router = t.router;
export const publicProcedure = t.procedure;
export const { createCallerFactory, router } = t;

export const appRouter = router({
  modelFile: modelFileRouter,
  media: mediaRouter,
  modelId: modelIdRouter,
  modelVersion: modelVersionRouter,
  settings: settingsRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

// const server = createHTTPServer({
//   router: appRouter,
// });

// server.listen(3000);
