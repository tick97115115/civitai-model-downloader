import { router, publicProcedure } from "./index";
import { type } from "arktype";
import { model_id } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import fileUrl from "file-url";
import { pathExists } from "path-exists";
import { getSettings } from "@server/settings";

export const mediaRouter = router({
  getImagePath: publicProcedure
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
      const imagePath = mvlayout.getImagePath(params.input.imageId);
      return {
        imagePath,
        imageFileName: mvlayout.getImageFileName(params.input.imageId),
        imageFileDirPath: mvlayout.getImageFileDirPath(),
        imageFileUrl: fileUrl(imagePath),
        isExists: await pathExists(imagePath),
      };
    }),
});
