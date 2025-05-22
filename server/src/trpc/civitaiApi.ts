import { router, publicProcedure } from "./trpc";
import {
  MODELS_ENDPOINT,
  models_request_opts,
  models_response,
} from "@shared/types/models_endpoint";
import { getSettings, getKy } from "@server/settings";
import type { StdRes } from "@shared/types/trpcResponse";
import { stdRes } from "@shared/types/trpcResponse";
import { type } from "arktype";

const modelsEndpointRes = stdRes.and({
  "data?": models_response,
});
type ModelsEndpointRes = typeof modelsEndpointRes.infer;

export const civitaiApiRouter = router({
  models: publicProcedure
    .input(models_request_opts)
    .mutation(async (params) => {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params.input)) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
      const res = await getKy().get(MODELS_ENDPOINT, {
        searchParams: queryParams,
        mode: "no-cors",
        timeout: 120000,
        headers:
          getSettings().civitaiToken !== ""
            ? {
                Authorization: `Bearer ${getSettings().civitaiToken}`,
              }
            : undefined,
      });

      if (!res.ok) {
        const result: ModelsEndpointRes = {
          code: 500,
          message: `response is not ok\n${res.status} ${res.statusText}`,
        };
        return result;
      }
      const json = await res.json();
      const data = models_response(json);
      if (data instanceof type.errors) {
        const result: ModelsEndpointRes = {
          code: 500,
          message: `parse json failed\n${data.summary}`,
        };
        return result;
      }
      const result: ModelsEndpointRes = {
        code: 200,
        message: "success",
        data: data,
      };
      return result;
    }),
  modelsLoadMore: publicProcedure
    .input(type({ next: "string" }))
    .query(async (params) => {
      const res = await getKy().get(params.input.next, {
        mode: "no-cors",
        timeout: 120000,
        headers:
          getSettings().civitaiToken !== ""
            ? {
                Authorization: `Bearer ${getSettings().civitaiToken}`,
              }
            : undefined,
      });
      if (!res.ok) {
        const result: ModelsEndpointRes = {
          code: 500,
          message: "request error",
        };
        return result;
      }
      const json = await res.json();
      const data = models_response(json);
      if (data instanceof type.errors) {
        const result: ModelsEndpointRes = {
          code: 500,
          message: `parse json error\n${data.summary}`,
        };
        return result;
      }
      const result: ModelsEndpointRes = {
        code: 200,
        message: `success!`,
        data: data,
      };
      return result;
    }),
});
