<script setup lang="ts">
import { trpcClient } from "@/utils/trpcClient";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

async function scanLocalModels() {
  ElMessage({
    message: `start refresh db`,
    type: `info`,
  });
  const result = await trpcClient.modelVersion.scanModelsAndSyncToDb.query();
  if (result.code === 200) {
    ElMessage({
      message: `success!`,
      type: `success`,
    });
  } else {
    ElMessage({
      message: `failed!`,
      type: `error`,
    });
  }
}
</script>

<template>
  <el-button type="primary" :icon="Refresh" @click="scanLocalModels"
    >Scan Local Models</el-button
  >
</template>
