import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/index";
import { createReadStream } from "node:fs";
import { getMediaDir } from "./fileStoreLayout";
import { getSettings } from "./settings";
import { join } from "node:path";

const app = new Hono();

app.use("/*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

const mediaDir = getMediaDir(getSettings().basePath);
app.get("/media/:fileName", async (c) => {
  const fileName = c.req.param("fileName");
  const filePath = join(mediaDir, fileName!);
  // @ts-ignore
  return new Response(createReadStream(filePath));
});

export default app;
