import { ModelIdLayout } from "../fileStoreLayout";
import { describe, test, expect } from "vitest";
import { join } from "node:path";
import sanitize from "sanitize-basename";
import * as _ from "lodash-es";
import { models_response } from "@shared/types/models_endpoint";
import { ModelId, ModelsResponse } from "@shared/types/models_endpoint";
import { read, readFileSync } from "node:fs";

// @ts-nocheck
export const models_res = models_response(
  // @ts-ignore
  JSON.parse(
    readFileSync(join(__dirname, "models_res.json"), "utf-8") as string
  )
) as ModelsResponse;
export const modelId1 = models_res.items[0];

describe("test layout class", () => {
  const basePath = __dirname;
  const milayout = new ModelIdLayout(basePath, modelId1 as ModelId);
  const mv = modelId1.modelVersions[0];
  const mvlayout = milayout.getModelVersionLayout(mv.id);
  const mfile = mv.files[0];
  const mimg = mv.images[0];
  test("test get media path", () => {
    expect(milayout.imgDir).eq(join(basePath, "media"));
  });

  test("test get modelId path", () => {
    expect(milayout.modelIdPath).eq(
      join(basePath, modelId1.type, modelId1.id.toString())
    );
  });

  test("test get modelVersion path", () => {
    expect(mvlayout.modelVersionPath).eq(
      join(milayout.modelIdPath, mv.id.toString())
    );
  });

  test("test get file path", () => {
    expect(mvlayout.getFilePath(mfile.id)).eq(
      join(mvlayout.modelVersionPath, `${mfile.id}_${sanitize(mfile.name)}`)
    );
  });

  test("test get image path", () => {
    expect(mvlayout.getImagePath(mimg.id)).eq(
      join(mvlayout.imgDir, `${mimg.id}.${_.last(mimg.url.split("."))}`)
    );
  });
});
