<script setup lang="ts">
import clipboard from "clipboardy";
import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import {
  Delete,
  Search,
  Share,
  Box,
  CopyDocument,
  Document,
  Download,
  Picture,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { trpcClient } from "@/utils/trpcClient";
import type { Client } from "@gopeed/rest";
import ModelDetailCardTabPaneFilesTable from "@/components/ModelDetailCardTabPaneFilesTable.vue";

const { gopeedClient, modelId, CivtAI_Token } = defineProps<{
  modelId: ModelId;
  gopeedClient: Client;
  CivtAI_Token: string;
}>();

async function downloadAll(modelId: ModelId, modelVersion: ModelVersion) {
  // download files
  modelVersion.files.map(async (file, index) => {
    const info = await trpcClient.getFilePath.mutate({
      modelId: modelId,
      versionId: modelVersion.id,
      fileId: file.id,
    });
    if (info.isExists === false) {
      const url = `${file.downloadUrl}?token=${CivtAI_Token}`;

      const res = await trpcClient.getFileResourceUrl.query({ url: url });
      await gopeedClient.createTask({
        req: { url: res.downloadUrl },
        opt: { name: info.fileName, path: info.fileDirPath },
      });
    }
  });
  modelVersion.images.map(async (image, index) => {
    const info = await trpcClient.getImagePath.mutate({
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

  await trpcClient.saveModelIdApiInfo.mutate({
    modelId,
  });

  await trpcClient.saveModelVersionApiInfo.mutate({
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
  const info = await trpcClient.getFilePath.mutate({
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
  const info = await trpcClient.getModelIdApiInfoJsonPath.mutate({
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
  const info = await trpcClient.getImagePath.mutate({
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
    v-for="modelVersion in modelId?.modelVersions"
    :key="modelVersion.id"
    :name="modelVersion.id"
  >
    <template #label>
      <span>{{ modelVersion.name }}</span>
    </template>

    <el-row :gutter="20">
      <el-col :xs="8" :sm="8">
        <el-space direction="vertical">
          <el-image
            :src="modelVersion.images[0]?.url"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            show-progress
            :initial-index="0"
            :preview-src-list="modelVersion.images.map((img, index) => img.url)"
            fit="contain"
            lazy
          />
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
        <el-space direction="vertical" style="width: 100%" fill="true">
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
            ></ModelDetailCardTabPaneFilesTable
          ></el-container>
        </el-space>
      </el-col>
    </el-row>
  </el-tab-pane>
</template>
