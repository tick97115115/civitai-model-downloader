import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import {
  model_id,
  model_version,
  ModelId,
} from "@shared/types/models_endpoint";
import {
  extractFilenameFromUrl,
  getMediaDir,
  ModelIdLayout,
} from "../fileStoreLayout";
import fileUrl from "file-url";
import { pathExists } from "path-exists";
import { getSettings } from "@server/settings";
import { getModelInfoFromModelIdEndpoint } from "@server/utils";
import { createOrConnectImagesByModelIdEndpointInfo } from "@server/prisma/crud/media";
import { findModelVersion } from "@shared/types/utils";
import { join } from "path";

export const mediaRouter = router({
  getMediaPath: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
        imageId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(
        getSettings().basePath,
        params.input.modelId
      );
      const mvlayout = milayout.getModelVersionLayout(params.input.versionId);
      const mediaPath = mvlayout.getMediaPath(params.input.imageId);
      return {
        imagePath: mediaPath,
        imageFileName: mvlayout.getMediaFileName(params.input.imageId),
        imageFileDirPath: mvlayout.getMediaFileDirPath(),
        isExists: await pathExists(mediaPath),
      };
    }),
  getMediaPathByUrl: publicProcedure
    .input(type({ url: "string" }))
    .mutation(async (params) => {
      const mediaPath = getMediaDir(getSettings().basePath);
      const mediaFileName = extractFilenameFromUrl(params.input.url);
      const mediaFilePath = join(mediaPath, mediaFileName);
      return {
        mediaPath: mediaPath,
        mediaFileName: mediaFileName,
        mediaFilePath: mediaFilePath,
        isExists: await pathExists(mediaPath),
      };
    }),
  getImagesFromModelIdEndpoint: publicProcedure
    .input(type({ modelId: model_id, modelVersion: model_version }))
    .mutation(async (params) => {
      const mi = await getModelInfoFromModelIdEndpoint(params.input.modelId.id);
      const imageRecords = await createOrConnectImagesByModelIdEndpointInfo(
        params.input.modelVersion.id,
        findModelVersion(mi as ModelId, params.input.modelVersion.id).images
      );
      return imageRecords;
    }),
});
