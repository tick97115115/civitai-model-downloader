<script setup lang="ts">
import clipboard from "clipboardy";
import { Picture, Document, Box, CopyDocument } from "@element-plus/icons-vue";
import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import { model_id, model_version } from "@shared/types/models_endpoint";
import { ElMessage } from "element-plus";
import { trpcClient } from "@/utils/trpcClient";
import type { Client } from "@gopeed/rest";
import ModelDetailCardTabPaneFilesTable from "@/components/ModelDetailCardTabPaneFilesTable.vue";
import { type } from "arktype";
import { ref } from "vue";

const showPreview = ref(false);

const { gopeedClient, modelId, CivtAI_Token } = defineProps<{
  modelId: ModelId;
  gopeedClient: Client;
  CivtAI_Token: string;
}>();

function insertTokenParam(url: string, token: string) {
  console.log(
    `this is the url I get from trpc: ${url}\n this is the token: ${token}`
  );
  // 创建一个URL对象以便更容易地处理各部分
  const urlObj = new URL(url);

  // 添加或更新token参数
  urlObj.searchParams.set("token", token);
  console.log(`this is the url I get after adding token: ${urlObj.toString()}`);
  // 返回完整的URL字符串
  return urlObj.toString();
}

async function TryToFetchImagesFromModelIdEndpoint(
  modelId: ModelId,
  modelVersion: ModelVersion
) {
  ElMessage({
    message: `Fetching images from modelId endpoint...`,
    type: "info",
  });
  const result = await trpcClient.media.getImagesFromModelIdEndpoint.mutate({
    modelId: modelId,
    modelVersion: modelVersion,
  });

  result.map(async (image, index) => {
    const info = await trpcClient.media.getMediaPathByUrl.mutate({
      url: image.url,
    });
    if (info.isExists === false) {
      await gopeedClient.createTask({
        req: { url: image.url },
        opt: { path: info.mediaFilePath, name: info.mediaFileName },
      });
      ElMessage({
        message: `Added image ${image.id} into task list.`,
        type: "success",
      });
    } else {
      ElMessage({
        message: `Image ${image.id} already exists.`,
        type: "warning",
      });
    }
  });
}

async function downloadAll(modelId: ModelId, modelVersion: ModelVersion) {
  // validate modelId and modelVersion
  const miOut = model_id(modelId);
  const mvOut = model_version(modelVersion);
  if (miOut instanceof type.errors) {
    ElMessage({
      message: `ModelId is invalid! ${miOut.summary}`,
      type: "error",
    });
    if (mvOut instanceof type.errors) {
      ElMessage({
        message: `ModelVersion is invalid! ${mvOut.summary}`,
        type: "error",
      });
    }
    return;
  }
  // download files
  for (let index = 0; index < modelVersion.files.length; index++) {
    const file = modelVersion.files[index];
    const info = await trpcClient.modelFile.getFilePath.mutate({
      modelId: modelId,
      versionId: modelVersion.id,
      fileId: file.id,
    });
    if (info.isExists === false) {
      const url = insertTokenParam(file.downloadUrl, CivtAI_Token);
      console.log(`this is the resource uri I get from trpc: ${url}`);

      const res = await trpcClient.modelFile.getFileResourceUrl.query({
        url: url,
      });
      if (res.code === 401) {
        ElMessage({
          duration: 5000,
          message: res.message,
          type: "warning",
        });
        return;
      }
      if (res.code !== 200) {
        ElMessage({
          duration: 5000,
          message: res.message,
          type: "error",
        });
        return;
      }
      console.log(`This is the resolved uri: ${res.downloadUrl}`);
      await gopeedClient.createTask({
        req: { url: res.downloadUrl },
        opt: { name: info.fileName, path: info.fileDirPath },
      });
    }
  }
  modelVersion.images.map(async (image, index) => {
    const info = await trpcClient.media.getMediaPath.mutate({
      modelId: modelId,
      versionId: modelVersion.id,
      imageId: image.id,
    });
    if (info.isExists === false) {
      await gopeedClient.createTask({
        req: { url: image.url },
        opt: { path: info.imageFileDirPath, name: info.imageFileName },
      });
    }
  });

  await trpcClient.modelId.saveModelIdApiInfo.mutate({
    modelId,
  });

  await trpcClient.modelVersion.saveModelVersionApiInfo.mutate({
    modelId,
    versionId: modelVersion.id,
  });

  ElMessage({
    message: `Added all resource into task list.`,
    type: "success",
  });
}

async function getFilePath(
  modelId: ModelId,
  modelVersionId: number,
  fileId: number
) {
  const info = await trpcClient.modelFile.getFilePath.mutate({
    modelId: modelId,
    versionId: modelVersionId,
    fileId: fileId,
  });
  ElMessage({
    message: `Trpc Connected! ${info.filePath}!`,
    type: "success",
  });
}

async function getModelIdApiInfoJsonPath(modelId: ModelId) {
  const info = await trpcClient.modelId.getModelIdApiInfoJsonPath.mutate({
    modelId: modelId,
  });
  ElMessage({
    message: `Trpc Connected! ${info.modelIdApiInfoJsonPath}!`,
    type: "success",
  });
}

async function getImagePath(
  modelId: ModelId,
  versionId: number,
  imgId: number
) {
  const info = await trpcClient.media.getMediaPath.mutate({
    modelId: modelId,
    versionId: versionId,
    imageId: imgId,
  });
  ElMessage({
    message: `Trpc Connected! ${info.imagePath}!`,
    type: "success",
  });
}
</script>

<template>
  <el-tab-pane
    v-for="modelVersion in modelId.modelVersions"
    :key="modelVersion.id"
    :name="modelVersion.id"
  >
    <template #label>
      <span>{{ modelVersion.name }}</span>
    </template>

    <el-image-viewer
      v-if="showPreview"
      :url-list="modelVersion.images.map((img, index) => img.url)"
      show-progress
      :initial-index="0"
      @close="showPreview = false"
    />

    <el-row :gutter="20">
      <el-col :xs="8" :sm="8">
        <el-space direction="vertical">
          <video
            v-if="
              modelVersion.images[0]?.type !== 'image' &&
              modelVersion.images.length > 0
            "
            style="width: 100%"
            autoplay
            muted
            loop
            :src="modelVersion.images[0]?.url ?? null"
            @click="showPreview = true"
          ></video>
          <el-image
            v-else-if="
              modelVersion.images[0]?.type === 'image' &&
              modelVersion.images.length > 0
            "
            :src="modelVersion.images[0]?.url"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            show-progress
            fit="contain"
            lazy
            @click="showPreview = true"
          />

          <el-empty v-else description="Have no preview images in json data." />

          <el-button
            type="primary"
            round
            :icon="Picture"
            @click="TryToFetchImagesFromModelIdEndpoint(modelId, modelVersion)"
          >
            >no previews in json? 🛠️</el-button
          >

          <el-button
            type="primary"
            round
            :icon="Picture"
            @click="
              getImagePath(modelId, modelVersion.id, modelVersion.images[0].id)
            "
            >Save Images</el-button
          >
          <el-button
            type="primary"
            round
            :icon="Document"
            @click="getModelIdApiInfoJsonPath(modelId)"
            >Save Info</el-button
          >
          <el-button
            type="success"
            round
            :icon="Box"
            @click="downloadAll(modelId, modelVersion)"
            >Save All</el-button
          >
        </el-space>
      </el-col>
      <el-col :xs="16" :sm="16">
        <el-space direction="vertical" style="width: 100%" :fill="true">
          <el-descriptions
            border
            title="Details"
            :column="1"
            style="width: 100%"
          >
            <el-descriptions-item>
              <template #label>
                <b>Type</b>
              </template>
              {{ modelId.type }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <b>Published</b>
              </template>
              {{ modelVersion.publishedAt }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <b>Base Model</b>
              </template>
              {{ modelVersion.baseModel }}
            </el-descriptions-item>
            <el-descriptions-item v-if="modelVersion.baseModelType">
              <template #label>
                <b>Model Series</b>
              </template>
              {{ modelVersion.baseModelType }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div>
                  <b>Trigger Words</b>
                </div>
                <el-button
                  type="primary"
                  :icon="CopyDocument"
                  @click="
                    async () => {
                      await clipboard.write(
                        modelVersion.trainedWords.join(', ')
                      );
                      ElMessage({
                        message: 'Copied!',
                        type: 'success',
                      });
                    }
                  "
                  >Copy All</el-button
                >
              </template>
              <el-check-tag
                style="overflow-wrap: break-word"
                v-for="(words, index) in modelVersion.trainedWords"
                :key="index"
                effect="dark"
                hit
                checked
                @click="
                  async () => {
                    await clipboard.write(words);
                    ElMessage({
                      message: 'Copied!',
                      type: 'success',
                    });
                  }
                "
              >
                {{ words }}</el-check-tag
              >
            </el-descriptions-item>
          </el-descriptions>

          <el-container style="width: 100%">
            <ModelDetailCardTabPaneFilesTable
              :model-id="modelId"
              :model-version="modelVersion"
              :gopeed-client="gopeedClient"
              :-civt-a-i_-token="CivtAI_Token"
            ></ModelDetailCardTabPaneFilesTable>
          </el-container>
          <div
            v-if="modelVersion.description"
            v-html="modelVersion.description"
          ></div>
        </el-space>
      </el-col>
    </el-row>
  </el-tab-pane>
</template>
