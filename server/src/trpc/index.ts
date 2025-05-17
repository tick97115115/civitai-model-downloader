import { router } from "./trpc";
import { mediaRouter } from "./media";
import { modelFileRouter } from "./modelFIle";
import { modelIdRouter } from "./modelId";
import { modelVersionRouter } from "./modelVersion";
import { settingsRouter } from "./settings";

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
