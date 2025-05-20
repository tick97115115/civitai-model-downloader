import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { model_id } from "@shared/types/models_endpoint";
import {
  extractFilenameFromUrl,
  getMediaDir,
  ModelIdLayout,
} from "../fileStoreLayout";
import fileUrl from "file-url";
import { pathExists } from "path-exists";
import { getSettings } from "@server/settings";
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
        imageFileUrl: fileUrl(mediaPath),
        isExists: await pathExists(mediaPath),
      };
    }),
});
