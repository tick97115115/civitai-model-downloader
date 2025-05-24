import { router } from "./trpc";
import { mediaRouter } from "./media";
import { modelFileRouter } from "./modelFIle";
import { modelIdRouter } from "./modelId";
import { modelVersionRouter } from "./modelVersion";
import { settingsRouter } from "./settings";
import { civitaiApiRouter } from "./civitaiApi";
import { tagsRouter } from "./tags";

export const appRouter = router({
  modelFile: modelFileRouter,
  media: mediaRouter,
  modelId: modelIdRouter,
  modelVersion: modelVersionRouter,
  settings: settingsRouter,
  civitaiApi: civitaiApiRouter,
  tags: tagsRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

// const server = createHTTPServer({
//   router: appRouter,
// });

// server.listen(3000);
