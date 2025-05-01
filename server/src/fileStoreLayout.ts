import { normalize, join, isAbsolute } from "node:path";
import sanitize from "sanitize-basename";
import * as _ from "lodash-es";
import type {
  ModelId,
  ModelVersion,
  ModelVersionFile,
  ModelVersionImage,
} from "@shared/types/models_endpoint";

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
function extractFilenameFromUrl(url: string): string {
    // Validate URL
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        throw new Error('Invalid URL provided');
    }

    // Get the pathname and split by slashes
    const pathParts = parsedUrl.pathname.split('/').filter(part => part.trim() !== '');
    
    // If no path parts exist, return empty string
    if (pathParts.length === 0) return '';
    
    // Get the last part (filename)
    const filenameWithParams = pathParts[pathParts.length - 1];
    
    // Remove any query parameters from the filename
    const filename = filenameWithParams.split(/[?#]/)[0];
    
    return filename;
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
    public basePath: string, 
    public modelVersion: ModelVersion,
    public imgDir: string
  ) {
    this.basePath = normalize(basePath)
    this.modelVersion = modelVersion
    this.imgDir = imgDir
  }

  getApiInfoJsonPath() :string {
    return join(this.basePath, `${this.modelVersion.id}.api-info.json`)
  }

  findFile(fileId: number): ModelVersionFile {
    const file = _.find(this.modelVersion.files, function(file) {
      return file.id === fileId
    })
    if (file === undefined) {
      throw new Error(`model have no file id: ${fileId}`)
    }
    return file
  }

  getFilePath(fileId: number): string {
    const modelFile = this.findFile(fileId)
    return join(join(this.basePath, `${fileId}_${sanitize(modelFile.name)}`))
  }
 
  findImage(imageId: number): ModelVersionImage {
    const img = _.find(this.modelVersion.images, function(img) {
      return img.id === imageId
    })
    if (img === undefined) {
      throw new Error(`model have no file id: ${imageId}`)
    }
    return img
  }

  getImagePath(imageId: number): string {
    const image = this.findImage(imageId)
    return join(this.imgDir, extractFilenameFromUrl(image.url))
  }
}

export class ModelIdLayout {
  imgDir: string;
  constructor(public basePath: string, public modelId: ModelId) {
    this.basePath = normalize(basePath)
    this.imgDir = join(this.basePath,'media')
    this.modelId = modelId
  }
  
  findModelVersion(modelVersionId: number): ModelVersion {
    const modelVersion = _.find(this.modelId.modelVersions, function(mv) {
        return mv.id === modelVersionId
   })
   if (modelVersion === undefined) {
       throw new Error(`model have no version id: ${modelVersionId}`)
   }
   return modelVersion
  }

  getModelIdDir(): string {
    return join(this.basePath, this.modelId.type, this.modelId.id.toString());
  }

  getApiInfoJsonPath(): string {
    return join(this.getModelIdDir(), `${this.modelId.id}.api-info.json`)
  }

  getModelVersionLayout(versionId: number) {
    return new ModelVersionLayout(
      join(this.getModelIdDir(), versionId.toString()), 
      this.findModelVersion(versionId),
      this.imgDir
    )
  }
}
