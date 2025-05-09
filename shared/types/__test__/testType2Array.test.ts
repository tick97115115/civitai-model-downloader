import { model_types } from "../baseModels/misc";
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
