import { describe, test, expect } from "vitest";
import { getKy } from "@server/settings";
import { model_id } from "@shared/types/models_endpoint";
import { type } from "arktype";

// @ts-ignore
const kyWithProxy = getKy();
test("request model resource url", async () => {
  const res = await kyWithProxy.get(
    "https://civitai.com/api/download/models/1379808",
    {
      timeout: 60000,
    }
  );

  if (!res.ok) {
    throw new Error(`Fetch error: ${res.statusText}`);
  }

  expect(res.url).toBeTypeOf("string");
  console.log(res.url);
});

test("validate model resource url", async () => {
  const res = await kyWithProxy.get("https://civitai.com/api/v1/models/941881");
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.statusText}`);
  }

  const data = await res.json();
  const out = model_id(data);
  if (out instanceof type.errors) {
    console.log(out.summary);
    throw new Error("Invalid model_id");
  }
  expect(out).toBeTypeOf("object");
});
