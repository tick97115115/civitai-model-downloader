import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { pathExists } from "path-exists";
import fileUrl from "file-url";
import { model_id } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "../fileStoreLayout";
import { getSettings, getKy } from "@server/settings";
import { stdRes } from "@shared/types/trpcResponse";

const getFileResourceUrlRes = stdRes.and({
  downloadUrl: "string.url",
});
type GetFileResourceUrlRes = typeof getFileResourceUrlRes.infer;

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
        throwHttpErrors: false,
      });
      if (res.status !== 200) {
        if (res.status === 401) {
          console.error("resolve resource url failed", res.statusText);
          const data: GetFileResourceUrlRes = {
            code: 401,
            message:
              "Unauthorized, may you have to purchase the model on civitai.",
            downloadUrl: "",
          };
          return data;
        } else if (res.status === 408) {
          console.error("resolve resource url failed", res.statusText);
          const data: GetFileResourceUrlRes = {
            code: 408,
            message: `timeout, ${res.statusText}`,
            downloadUrl: "",
          };
          return data;
        } else if (res.status <= 200 || res.status > 299) {
          console.error("resolve resource url failed", res.statusText);
          const data: GetFileResourceUrlRes = {
            code: 500,
            message: `resolve resource url failed with unknown error: ${res.statusText}`,
            downloadUrl: "",
          };
          return data;
        }
      }
      const data: GetFileResourceUrlRes = {
        code: 200,
        message: "success",
        downloadUrl: res.url,
      };
      return data;
    }),
});
