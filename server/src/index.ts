// import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'
// import { appRouter } from "./trpc";
import { appRouter } from "./trpc/index";

const app = new Hono();

app.use("/*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

export default app;
