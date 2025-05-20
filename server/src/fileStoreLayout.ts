import { normalize, join, isAbsolute } from "node:path";
import sanitize from "sanitize-basename";
import * as _ from "lodash-es";
import type {
  ModelId,
  ModelVersion,
  ModelVersionFile,
  ModelVersionImage,
} from "@shared/types/models_endpoint";
import { ModelTypes } from "@shared/types/baseModels/misc";
import { findModelVersion } from "@shared/types/utils";
import { getSettings } from "./settings";
import { pathExists } from "path-exists";
/**
 * The layout of directory:
 * {baseDir} / {modelType} / {modelId} / {modelId}.api-info.json
 * {baseDir} / {modelType} / {modelId} / {versionId} / {fileId}_{fileName}
 * {baseDir} / {modelType} / {modelId} / {versionId} / {versionId}.api-info.json
 * {baseDir} / "media" / {imageId}.xxx
 */

/**
 * Extracts the filename from a valid URL
 * @param url The URL string to process
 * @returns The filename portion of the URL
 * @throws {Error} If the input is not a valid URL
 */
export function extractFilenameFromUrl(url: string): string {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    throw new Error("Invalid URL provided");
  }

  // Get the pathname and split by slashes
  const pathParts = parsedUrl.pathname
    .split("/")
    .filter((part) => part.trim() !== "");

  // If no path parts exist, return empty string
  if (pathParts.length === 0) return "";

  // Get the last part (filename)
  const filenameWithParams = pathParts[pathParts.length - 1];

  // Remove any query parameters from the filename
  const filename = filenameWithParams.split(/[?#]/)[0];

  return filename;
}

export function getModelIdPath(
  basePath: string,
  modelType: ModelTypes,
  modelId: number
) {
  return join(normalize(basePath), modelType, modelId.toString());
}

export function getMediaDir(basePath: string) {
  return join(basePath, "media");
}

export function getMediaFilePathByFileName(fileName: string) {
  return join(getMediaDir(getSettings().basePath), fileName);
}

export function getApiInfoJsonFileName(id: number): string {
  return `${id}.api-info.json`;
}

export function getModelIdApiInfoJsonPath(
  basePath: string,
  modelType: ModelTypes,
  modelId: number
): string {
  return join(
    getModelIdPath(basePath, modelType, modelId),
    getApiInfoJsonFileName(modelId)
  );
}

export function getModelVersionPath(
  basePath: string,
  modelType: ModelTypes,
  modelId: number,
  versionId: number
) {
  return join(
    getModelIdPath(basePath, modelType, modelId),
    versionId.toString()
  );
}

export function getModelVersionApiInfoJsonPath(
  basePath: string,
  modelType: ModelTypes,
  modelId: number,
  modelVersionId: number
) {
  return join(
    getModelVersionPath(basePath, modelType, modelId, modelVersionId),
    getApiInfoJsonFileName(modelVersionId)
  );
}

// // Test cases
// try {
//     console.log(extractFilenameFromUrl('https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/df372d95-4f9b-4363-a86c-82a11d166f40/width=450/6039981.jpeg'));
//     // Output: "6039981.jpeg"

//     console.log(extractFilenameFromUrl('https://example.com/path/to/file.png?param=value'));
//     // Output: "file.png"

//     console.log(extractFilenameFromUrl('not-a-url'));
//     // Throws Error: "Invalid URL provided"
// } catch (e) {
//     console.error(e.message);
// }

export class ModelVersionLayout {
  constructor(
    public modelVersionPath: string,
    public modelVersion: ModelVersion,
    public imgDir: string
  ) {
    this.modelVersionPath = normalize(modelVersionPath);
    this.modelVersion = modelVersion;
    this.imgDir = imgDir;
  }

  getApiInfoJsonFileDirPath(): string {
    return this.modelVersionPath;
  }

  getApiInfoJsonFileName(): string {
    return getApiInfoJsonFileName(this.modelVersion.id);
  }

  getApiInfoJsonPath(): string {
    return join(
      this.getApiInfoJsonFileDirPath(),
      this.getApiInfoJsonFileName()
    );
  }

  findFile(fileId: number): ModelVersionFile {
    const file = _.find(this.modelVersion.files, function (file) {
      return file.id === fileId;
    });
    if (file === undefined) {
      throw new Error(`model have no file id: ${fileId}`);
    }
    return file;
  }

  getFileName(fileId: number): string {
    const modelFile = this.findFile(fileId);
    return `${fileId}_${sanitize(modelFile.name)}`;
  }

  getFileDirPath(): string {
    return this.modelVersionPath;
  }

  getFilePath(fileId: number): string {
    const modelFile = this.findFile(fileId);
    return join(join(this.getFileDirPath(), this.getFileName(fileId)));
  }

  findMedia(mediaId: number): ModelVersionImage {
    const img = _.find(this.modelVersion.images, function (img) {
      return img.id === mediaId;
    });
    if (img === undefined) {
      throw new Error(`model have no file id: ${mediaId}`);
    }
    return img;
  }

  getMediaFileName(mediaId: number): string {
    const media = this.findMedia(mediaId);
    return extractFilenameFromUrl(media.url);
  }

  getMediaFileDirPath(): string {
    return this.imgDir;
  }

  getMediaPath(mediaId: number): string {
    return join(this.getMediaFileDirPath(), this.getMediaFileName(mediaId));
  }
}

export class ModelIdLayout {
  imgDir: string;
  modelIdPath: string;
  constructor(public basePath: string, public modelId: ModelId) {
    this.modelIdPath = getModelIdPath(
      basePath,
      this.modelId.type,
      this.modelId.id
    );
    this.imgDir = getMediaDir(basePath);
    this.modelId = modelId;
  }

  findModelVersion(modelVersionId: number): ModelVersion {
    return findModelVersion(this.modelId, modelVersionId);
  }

  getApiInfoJsonFileDir(): string {
    return this.modelIdPath;
  }

  getApiInfoJsonFileName(): string {
    return getApiInfoJsonFileName(this.modelId.id);
  }

  getApiInfoJsonPath(): string {
    return getModelIdApiInfoJsonPath(
      this.basePath,
      this.modelId.type,
      this.modelId.id
    );
  }

  getModelVersionLayout(versionId: number) {
    return new ModelVersionLayout(
      // join(this.modelIdPath, versionId.toString()),
      getModelVersionPath(
        this.basePath,
        this.modelId.type,
        this.modelId.id,
        versionId
      ),
      this.findModelVersion(versionId),
      this.imgDir
    );
  }
}
