// import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream, streamText, streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'
// import { appRouter } from "./trpc";
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

  // return stream(c, async (stream) => {
  //   // Write a process to be executed when aborted.
  //   stream.onAbort(() => {
  //     console.log("Aborted!");
  //   });
  //   // Write a Uint8Array.
  //   // await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
  //   // Pipe a readable stream.
  //   // @ts-ignore
  //   await stream.write(createReadStream(join(mediaDir, fileName!)));
  // });
});

export default app;
