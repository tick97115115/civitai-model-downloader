<script setup lang="ts">
import type { ModelVersion, ModelId } from "@shared/types/models_endpoint";
import { ElMessage } from "element-plus";
import { CopyDocument, Download } from "@element-plus/icons-vue";
import { trpcClient } from "@/utils/trpcClient";
import clipboard from "clipboardy";
import type { Client } from "@gopeed/rest";

const { modelId, modelVersion, gopeedClient, CivtAI_Token } = defineProps<{
  modelId: ModelId;
  modelVersion: ModelVersion;
  gopeedClient: Client;
  CivtAI_Token: string;
}>();

function removeFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
}

async function getSDWebuiLoraName(
  modelId: ModelId,
  versionId: number,
  index: number
) {
  const info = await trpcClient.modelFile.getFilePath.mutate({
    modelId: modelId,
    versionId: versionId,
    fileId: modelVersion.files[index].id,
  });
  const loraString = `<lora:${removeFileExtension(
    modelVersion.files[index].name
  )}:1>`;
  await clipboard.write(loraString);
  ElMessage({
    message: `Copied!: \n${loraString}`,
    type: "success",
  });
}

async function downloadFile(index: number) {
  const info = await trpcClient.modelFile.getFilePath.mutate({
    modelId: modelId,
    versionId: modelVersion.id,
    fileId: modelVersion.files[index].id,
  });
  if (info.isExists === false) {
    const url = `${modelVersion.files[index].downloadUrl}?token=${CivtAI_Token}`;

    const res = await trpcClient.modelFile.getFileResourceUrl.query({
      url: url,
    });
    await gopeedClient.createTask({
      req: { url: res.downloadUrl },
      opt: { name: info.fileName, path: info.fileDirPath },
    });
  }
}
</script>

<template>
  <el-table :data="modelVersion.files" style="width: 100%" table-layout="auto">
    <el-table-column prop="name" show-overflow-tooltip Label="File Name" />
    <el-table-column Label="Lora Trigger">
      <template #default="scope">
        <el-button-group>
          <el-button
            type="primary"
            size="small"
            @click.prevent="
              getSDWebuiLoraName(modelId, modelVersion.id, scope.$index)
            "
          >
            Copy </el-button
          ><el-button
            type="primary"
            size="small"
            :icon="Download"
            @click="downloadFile(scope.$index)"
            >Download</el-button
          ></el-button-group
        ></template
      >
    </el-table-column>
  </el-table>
</template>
