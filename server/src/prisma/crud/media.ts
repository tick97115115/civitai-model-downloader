import type { ModelId_ModelVersionImage } from "@shared/types/modelId_endpoint";
import type { ModelVersionImage } from "@shared/types/models_endpoint";
import { getPrismaClient, getSettings } from "@server/settings";
import { extractFilenameFromUrl } from "@server/fileStoreLayout";
import { removeFileExtension } from "@server/utils";

export async function createOrConnectImagesByModelIdEndpointInfo(
  modelVersionId: number,
  mediaArray: Array<ModelId_ModelVersionImage>
) {
  const mediaArrayWithId: Array<ModelVersionImage> = mediaArray.map((image) => {
    const imageFileName = extractFilenameFromUrl(image.url);
    const imageFileNameWithoutExt = removeFileExtension(imageFileName);
    return {
      id: Number(imageFileNameWithoutExt),
      ...image,
    };
  });
  const mvRecord = await getPrismaClient().modelVersion.update({
    where: {
      id: modelVersionId,
    },
    data: {
      images: {
        connectOrCreate: mediaArrayWithId.map((image) => ({
          where: { id: image.id },
          create: {
            id: image.id,
            url: image.url,
            nsfwLevel: image.nsfwLevel,
            width: image.width,
            height: image.height,
            hash: image.hash,
            type: image.type,
          },
        })),
      },
    },
    include: {
      images: true,
    },
  });
  return mvRecord.images;
}
