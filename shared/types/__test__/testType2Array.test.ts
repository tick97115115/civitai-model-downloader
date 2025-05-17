import { base_models, BaseModelsArray } from "../baseModels/misc";
import { type } from "arktype";
import { describe, test, expect } from "vitest";
import * as _ from "lodash-es";

test("test enumerated type in runtime", () => {
  const out = base_models("Illustrious");

  let result = ``;

  if (out instanceof type.errors) {
    result = "error";
  } else {
    result = `${typeof out}`;
  }

  expect(result).eq("string");
});

test("test baseModelsArray is a Array<string> type", () => {
  const ref = BaseModelsArray;

  expect(BaseModelsArray.length > 10).eq(true);
  expect(BaseModelsArray[0]).toBeTypeOf("string");
});
