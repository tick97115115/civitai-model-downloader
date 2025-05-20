import { promises as fs } from "node:fs";
import { join } from "node:path";
import { pathExists } from "path-exists";
import { getSettings } from "./settings";
import fg from "fast-glob";

/**
 * 检查文件夹内是否存在至少一个 .safetensors 文件
 * @param dirPath 文件夹的绝对路径
 * @returns Promise<boolean> 是否存在 .safetensors 文件
 */
export async function hasSafetensorsFile(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const fullPath = join(dirPath, file);
      const stats = await fs.stat(fullPath);

      if (stats.isFile() && file.endsWith(".safetensors")) {
        return true; // 找到立即返回 true
      }
    }

    return false; // 遍历完成未找到
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return false; // 出错时返回 false
  }
}

export async function checkIfModelVersionOnDisk(modelVersionPath: string) {
  if (
    (await pathExists(modelVersionPath)) &&
    (await hasSafetensorsFile(modelVersionPath))
  ) {
    return true;
  }
  return false;
}

export async function scanModels() {
  const expression =
    process.platform === "win32"
      ? `${fg.convertPathToPattern(getSettings().basePath)}/**/*.safetensors`
      : `${getSettings().basePath}/**/*.safetensors`;
  const safetensors = await fg.async(expression);
  return safetensors;
}
