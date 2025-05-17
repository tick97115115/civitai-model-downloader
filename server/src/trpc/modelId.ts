import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id, models_request_opts } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import { getSettings } from "@server/settings";
import { writeJsonFile } from "write-json-file";
import { hasSafetensorsFile } from "@server/utils";

export const modelIdRouter = router({
  getModelIdApiInfoJsonPath: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      const modelIdApiInfoJsonPath = milayout.getApiInfoJsonPath();
      return {
        modelIdApiInfoJsonPath,
        modelIdApiInfoJsonFileName: milayout.getApiInfoJsonFileName(),
        modelIdApiInfoJsonFileDir: milayout.getApiInfoJsonFileDir(),
        modelIdApiInfoJsonFileUrl: fileUrl(modelIdApiInfoJsonPath),
        isExists: await pathExists(modelIdApiInfoJsonPath),
      };
    }),
  saveModelIdApiInfo: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      await writeJsonFile(milayout.getApiInfoJsonPath(), params.input.modelId);
    }),
  checkIfModelIdOnDiskAndIfLatest: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      const newestMVLayout = milayout.getModelVersionLayout(
        params.input.modelId.modelVersions[0].id
      );
      const result = {
        onDisk: false,
        hasNewest: false,
      };
      if (
        (await pathExists(milayout.modelIdPath)) &&
        (await hasSafetensorsFile(milayout.modelIdPath))
      ) {
        result.onDisk = true;
      }
      for (
        let index = 0;
        index < newestMVLayout.modelVersion.files.length;
        index++
      ) {
        const element = newestMVLayout.modelVersion.files[index];
        const filePath = newestMVLayout.getFilePath(element.id);
        if (await pathExists(filePath)) {
          result.hasNewest = true;
          break;
        }
      }
      return result;
    }),
  findLocalModels: publicProcedure
    .input(models_request_opts)
    .mutation(async (params) => {}),
});
