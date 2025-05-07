import { serve } from "@hono/node-server";
import HonoApp from "./index";

serve(
  {
    fetch: HonoApp.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`server runs at: ${info.address}:${info.port}`);
  }
);
