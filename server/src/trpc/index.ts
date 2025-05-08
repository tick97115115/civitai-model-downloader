import { initTRPC } from "@trpc/server";
import { type } from "arktype";
import { model_id, model_version } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import fileUrl from "file-url";
import { pathExists } from "path-exists";
import { writeJsonFile } from "write-json-file";
import { getKy } from "@server/settings";

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

const BASE_PATH = String.raw`D:\AI_Drawer\civitai_models`;

export const appRouter = router({
  modelFile: {},
  media: {},
  modelId: {},
  modelVersion: {},
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

// const server = createHTTPServer({
//   router: appRouter,
// });

// server.listen(3000);
