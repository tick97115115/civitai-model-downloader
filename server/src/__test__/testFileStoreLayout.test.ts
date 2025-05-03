import { ModelIdLayout, ModelVersionLayout } from "../fileStoreLayout";
import { beforeAll, describe, test, expect } from "vitest";
import { join, normalize, dirname } from "node:path";
import { validate_all_records } from "@shared/types/__test__/load_data_list";
import sanitize from "sanitize-basename";
import * as _ from "lodash-es";

describe("test layout class", () => {
  const records = validate_all_records();
  if (records === undefined) {
    throw new Error("validate_all_records function not working!");
  }
  const modelId1 = records[0];
  const basePath = __dirname;
  const milayout = new ModelIdLayout(basePath, modelId1);
  const mv = modelId1.modelVersions[0]
  const mvlayout = milayout.getModelVersionLayout(mv.id)
  const mfile = mv.files[0]
  const mimg = mv.images[0]
  test("test get media path", () => {
    expect(milayout.imgDir).eq(join(basePath, "media"))
  });

  test("test get modelId path", () => {
    expect(milayout.modelIdPath).eq(join(basePath, modelId1.type, modelId1.id.toString()))
  })

  test("test get modelVersion path", () => {
    expect(mvlayout.modelVersionPath).eq(join(milayout.modelIdPath, mv.id.toString()))
  })

  test("test get file path", () => {
    expect(mvlayout.getFilePath(mfile.id)).eq(join(mvlayout.modelVersionPath, `${mfile.id}_${sanitize(mfile.name)}`))
  })

  test("test get image path", () => {
    expect(mvlayout.getImagePath(mimg.id)).eq(join(mvlayout.imgDir, `${mimg.id}.${_.last(mimg.url.split('.'))}`))
  })
});
