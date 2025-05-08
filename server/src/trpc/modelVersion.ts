import { router, publicProcedure, createCallerFactory } from "./index";
import { settingsRouter } from "./settings";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id, model_version } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import { getSettings } from "@server/settings";
import { writeJsonFile } from "write-json-file";

const settingsCaller = createCallerFactory(settingsRouter)({});

export const modelFileRouter = router({
  getModelVersionApiInfoJsonPath: publicProcedure
    .input(
      type({
        modelId: model_id,
        modelVersionId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      const mvlayout = milayout.getModelVersionLayout(
        params.input.modelVersionId
      );
      const modelVersionApiInfoJsonPath = mvlayout.getApiInfoJsonPath();
      return {
        modelVersionApiInfoJsonPath,
        modelVersionApiInfoJsonFileName: mvlayout.getApiInfoJsonFileName(),
        modelVersionApiInfoJsonFileDir: mvlayout.getApiInfoJsonFileDirPath(),
        modelVersionApiInfoJsonFileUrl: fileUrl(modelVersionApiInfoJsonPath),
        isExists: await pathExists(modelVersionApiInfoJsonPath),
      };
    }),
  saveModelVersionApiInfo: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      const mvlayout = milayout.getModelVersionLayout(params.input.versionId);
      await writeJsonFile(mvlayout.getApiInfoJsonPath(), mvlayout.modelVersion);
    }),
});
