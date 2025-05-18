import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import { getSettings } from "@server/settings";
import { writeJsonFile } from "write-json-file";
import { scanModelsAndSyncToDb } from "@server/prisma/crud/modelVersion";
import { stdRes } from "@shared/types/trpcResponse";
import type { StdRes } from "@shared/types/trpcResponse";

export const modelVersionRouter = router({
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
  scanModelsAndSyncToDb: publicProcedure
    .input(type("undefined"))
    .query(async () => {
      try {
        await scanModelsAndSyncToDb();
      } catch (error) {
        console.error(error);
        const result: StdRes = {
          code: 500,
          message: `failed`,
        };
        return result;
      }
      const result: StdRes = {
        code: 200,
        message: `success!`,
      };
      return result;
    }),
});
