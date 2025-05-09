import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/trpc/index";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${window.origin}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // credentials: "include",
        });
      },
    }),
  ],
});
