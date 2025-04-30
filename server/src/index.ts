import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hono meets Node.js"));

const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});

if (server.address() !== null) {
  console.log(`server address: ${server.address()?.toString()}`);
}
