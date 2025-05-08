import { router, publicProcedure, createCallerFactory } from "./index";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id, model_version } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import { getSettings, getKy } from "@server/settings";

export const modelFileRouter = router({
  getFilePath: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
        fileId: "number",
      })
    )
    .mutation(async (params) => {
      const settings = getSettings().basePath;
      const milayout = new ModelIdLayout(settings, params.input.modelId);
      const mvlayout = milayout.getModelVersionLayout(params.input.versionId);
      const filePath = mvlayout.getFilePath(params.input.fileId);
      return {
        filePath,
        fileName: mvlayout.getFileName(params.input.fileId),
        fileDirPath: mvlayout.getFileDirPath(),
        fileUrl: fileUrl(filePath),
        isExists: await pathExists(filePath),
      };
    }),
  getFileResourceUrl: publicProcedure
    .input(
      type({
        url: "string.url",
      })
    )
    .query(async (params) => {
      const res = await getKy().get(params.input.url, {
        timeout: 60000,
      });
      if (!res.ok) {
        throw new Error(`Fetch error: ${res.statusText}`);
      }
      return {
        downloadUrl: res.url,
      };
    }),
});
