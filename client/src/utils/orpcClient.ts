import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { OrpcRouter } from "@server/orpc";

const link = new RPCLink({
  url: `${window.origin}/orpc`,
  headers: { Authorization: "Bearer token" },
});

export const orpc: RouterClient<OrpcRouter> = createORPCClient(link);
