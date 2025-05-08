<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import * as _ from "lodash";
import { orpc } from "@/utils/orpcClient";

const dialogTableVisible = ref(false);

async function getSettings() {
  // @ts-ignore
  // const dirHandler: string = await window.showDirectoryPicker();
  const settingsInfo = await orpc.settings.get();
  ElMessage({
    message: `Base path: ${settingsInfo.basePath} | civitai token: ${settingsInfo.civitaiToken}`,
    type: "success",
  });
}
</script>

<template>
  <div>
    <el-button
      type="primary"
      :icon="Setting"
      @click="dialogTableVisible = !dialogTableVisible"
      >Downloads Management</el-button
    >
    <el-dialog
      v-model="dialogTableVisible"
      title="Shipping address"
      width="800"
    >
      <el-button @click="getSettings">Clear download tasks</el-button>
    </el-dialog>
  </div>
</template>
