import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import {
  model_id,
  model_version,
  ModelId,
} from "@shared/types/models_endpoint";
import type { LocalModelsResponse } from "@shared/types/local/trpc_models";
import { local_models_request_opts } from "@shared/types/local/trpc_models";
import type { ModelTypes } from "@shared/types/baseModels/misc";
import {
  extractFilenameFromUrl,
  getMediaDir,
  getModelVersionPath,
  ModelIdLayout,
} from "../fileStoreLayout";
import { getPrismaClient, getSettings } from "@server/settings";
import { writeJsonFile } from "write-json-file";
import { checkIfModelVersionOnDisk, hasSafetensorsFile } from "@server/utils";
import { findManyModels } from "@server/prisma/crud/modelId";
import { deleteOneModelVersion } from "@server/prisma/crud/modelVersion";
import { readFile } from "node:fs/promises";
import {
  getModelIdApiInfoJsonPath,
  getModelVersionApiInfoJsonPath,
} from "@server/fileStoreLayout";
import { join } from "node:path";

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
    .input(local_models_request_opts)
    .mutation(async (params) => {
      let result = await findManyModels(params.input);

      // check if modelversion in db have corresponding model file on disk, if not remove the record.
      let haveGhostRecord = false;

      // iterates untill no ghost record in result
      do {
        haveGhostRecord = false;

        for (let i = 0; i < result.records.length; i++) {
          const model = result.records[i];
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
          result = await findManyModels(params.input);
        }
      } while (haveGhostRecord);

      const items: Array<ModelId> = [];
      for (let i = 0; i < result.records.length; i++) {
        const mi = result.records[i];
        const modelIdJsonFilePath = getModelIdApiInfoJsonPath(
          getSettings().basePath,
          mi.type.name as ModelTypes,
          mi.id
        );
        if ((await pathExists(modelIdJsonFilePath)) === false) {
          console.log(
            `modelId ${mi.id}'s json file: ${modelIdJsonFilePath} not exists, will be exclude from process.`
          );
          continue;
        }
        const modelIdJsonFile = await readFile(modelIdJsonFilePath, {
          encoding: "utf-8",
        });
        const modelIdJson = model_id(JSON.parse(modelIdJsonFile));
        if (modelIdJson instanceof type.errors) {
          console.log(
            `parse modelId object failed, will be exclude from execution:`
          );
          console.log(modelIdJson.summary);
          continue;
        }

        modelIdJson.modelVersions = [];
        // iterates corresponding modelVersion objects
        for (let j = 0; j < mi.modelVersions.length; j++) {
          const mv = mi.modelVersions[j];
          const modelVersionJsonFilePath = getModelVersionApiInfoJsonPath(
            getSettings().basePath,
            mi.type.name as ModelTypes,
            mi.id,
            mv.id
          );
          if ((await pathExists(modelVersionJsonFilePath)) === false) {
            console.log(
              `modelVersion ${mv.id}'s json file: ${modelVersionJsonFilePath} not exists, will be exclude from process.`
            );
            continue;
          }
          const modelVersionJsonFile = await readFile(
            modelVersionJsonFilePath,
            { encoding: "utf-8" }
          );
          const modelVersionJson = model_version(
            JSON.parse(modelVersionJsonFile)
          );
          if (modelVersionJson instanceof type.errors) {
            console.log(
              `parse modelVersion object failed, will be exclude from execution:`
            );
            console.log(modelVersionJson.summary);
            continue;
          }

          // at start check if images is empty, if empty, insert db records
          if (modelVersionJson.images.length === 0) {
            const modelVersionImages =
              await getPrismaClient().modelVersionImage.findMany({
                where: {
                  modelVersionId: modelVersionJson.id,
                },
              });
            for (let k = 0; k < modelVersionImages.length; k++) {
              const image = modelVersionImages[k];
              modelVersionJson.images.push({
                id: image.id,
                nsfwLevel: image.nsfwLevel,
                url: image.url,
                width: image.width,
                height: image.height,
                hash: image.hash,
                type: image.type,
              });
            }
          }

          // replace images.url with local media cache if already downloaded
          const imageDir = getMediaDir(getSettings().basePath);
          for (let k = 0; k < modelVersionJson.images.length; k++) {
            const image = modelVersionJson.images[k];
            const imageFileName = extractFilenameFromUrl(image.url);
            const imagePath = join(imageDir, imageFileName);
            if (await pathExists(imagePath)) {
              image.url = `/media/${imageFileName}`;
            }
          }
          modelIdJson.modelVersions.push(modelVersionJson);
        }

        // push to items
        items.push(modelIdJson);
      }

      // construct a response
      const modelsResponse: LocalModelsResponse = {
        items: items,
        metadata: {
          totalItems: result.totalCount,
          currentPage: params.input.page,
          pageSize: params.input.limit,
          totalPages: Math.ceil(result.totalCount / params.input.limit),
        },
      };
      return modelsResponse;
    }),
});
