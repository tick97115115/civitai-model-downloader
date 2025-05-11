import { model_types, baseModels } from "../baseModels/misc";
import { type } from "arktype";
import { describe, test, expect } from "vitest";
import * as _ from "lodash-es";

test("convert model_types to array", () => {
  const modelTypesArray = _.map(model_types.json, (v, k) => v["unit"]);
  expect(modelTypesArray).toContainEqual([
    "AestheticGradient",
    "Checkpoint",
    "Controlnet",
    "Detection",
    "DoRA",
    "TextualInversion",
    "Hypernetwork",
    "LORA",
    "Poses",
    "LoCon",
    "Other",
    "MotionModule",
    "Upscaler",
    "VAE",
    "Wildcards",
    "Workflows",
  ]);
});

test("test enumerated type in runtime", () => {
  const out = baseModels("Illustrious");

  let result = ``;

  if (out instanceof type.errors) {
    result = "error";
  } else {
    result = `${typeof out}`;
  }

  expect(result).eq("string");
});
