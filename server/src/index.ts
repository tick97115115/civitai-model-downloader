// import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'
import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { appRouter } from "./trpc";
import { orpcRouter } from "./orpc";

const app = new Hono();

// const handler = new RPCHandler(orpcRouter);

app.use("/*", cors());

const handler = new OpenAPIHandler(orpcRouter);

app.use("/orpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/orpc",
    context: {}, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

export default app;
