import { initTRPC } from "@trpc/server";
import { type } from "arktype";
import { model_id } from "@shared/types/models_endpoint";
import { ModelIdLayout } from "./fileStoreLayout";
import fileUrl from "file-url";
import { pathExists } from "path-exists";
import { writeJsonFile } from "write-json-file";
import { hasSafetensorsFile } from "./utils";
import { getKy } from "@server/settings";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

const BASE_PATH = String.raw`D:\AI_Drawer\civitai_models`;

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return "Hello!";
  }),
  getFilePath: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
        fileId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
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
  getImagePath: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
        imageId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
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
  getModelIdApiInfoJsonPath: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
      const modelIdApiInfoJsonPath = milayout.getApiInfoJsonPath();
      return {
        modelIdApiInfoJsonPath,
        modelIdApiInfoJsonFileName: milayout.getApiInfoJsonFileName(),
        modelIdApiInfoJsonFileDir: milayout.getApiInfoJsonFileDir(),
        modelIdApiInfoJsonFileUrl: fileUrl(modelIdApiInfoJsonPath),
        isExists: await pathExists(modelIdApiInfoJsonPath),
      };
    }),
  getModelVersionApiInfoJsonPath: publicProcedure
    .input(
      type({
        modelId: model_id,
        modelVersionId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
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
  saveModelIdApiInfo: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
      await writeJsonFile(milayout.getApiInfoJsonPath(), params.input.modelId);
    }),
  saveModelVersionApiInfo: publicProcedure
    .input(
      type({
        modelId: model_id,
        versionId: "number",
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
      const mvlayout = milayout.getModelVersionLayout(params.input.versionId);
      await writeJsonFile(mvlayout.getApiInfoJsonPath(), mvlayout.modelVersion);
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
  checkIfModelIdOnDiskAndIfLatest: publicProcedure
    .input(
      type({
        modelId: model_id,
      })
    )
    .mutation(async (params) => {
      const milayout = new ModelIdLayout(BASE_PATH, params.input.modelId);
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
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

// const server = createHTTPServer({
//   router: appRouter,
// });

// server.listen(3000);
