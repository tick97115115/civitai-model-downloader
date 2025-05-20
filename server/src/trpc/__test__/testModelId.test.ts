import { createCallerFactory } from "@server/trpc/trpc";
import { modelIdRouter } from "@server/trpc/modelId";
import { test, expect } from "vitest";

const createModelIdCaller = createCallerFactory(modelIdRouter);
const modelIdCaller = createModelIdCaller({});

test("findmodels procedure", async () => {
  const result = await modelIdCaller.findLocalModels({ limit: 20, page: 1 });
  expect(result.items.length).eq(20);
});
