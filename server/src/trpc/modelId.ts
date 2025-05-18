import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id, models_request_opts } from "@shared/types/models_endpoint";
import type { ModelTypes } from "@shared/types/baseModels/misc";
import { getModelVersionPath, ModelIdLayout } from "../fileStoreLayout";
import { getSettings } from "@server/settings";
import { writeJsonFile } from "write-json-file";
import { checkIfModelVersionOnDisk, hasSafetensorsFile } from "@server/utils";
import { findManyModels } from "@server/prisma/crud/modelId";
import { deleteOneModelVersion } from "@server/prisma/crud/modelVersion";

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
    .mutation(async (params) => {
      let records = await findManyModels(params.input);

      // check if modelversion in db have corresponding model file on disk, if not remove the record.
      let haveGhostRecord = false;

      do {
        haveGhostRecord = false;

        for (let i = 0; i < records.length; i++) {
          const model = records[i];
          for (let j = 0; j < model.modelVersions.length; j++) {
            const modelVersion = model.modelVersions[j];
            const modelVersionPath = getModelVersionPath(
              getSettings().basePath,
              model.type.name as ModelTypes,
              model.id,
              modelVersion.id
            );
            const onDisk = await checkIfModelVersionOnDisk(modelVersionPath);
            if (!onDisk) {
              await deleteOneModelVersion(modelVersion.id, model.id);
              if (haveGhostRecord !== true) {
                haveGhostRecord = true;
              }
            }
          }
        }

        if (haveGhostRecord) {
          records = await findManyModels(params.input);
        }
      } while (haveGhostRecord);

      // iterates untill no ghost record in result
      return records;
    }),
});
