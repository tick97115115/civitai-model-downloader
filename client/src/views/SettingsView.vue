<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import * as _ from "lodash";
import type { Settings } from "@shared/types/settings";
// import { orpc } from "@/utils/orpcClient";
// import { trpcClient } from "@/utils/trpcClient";
import { useSettingsStore } from "@/stores/settings";
import { storeToRefs } from "pinia";

const dialogTableVisible = ref(false);

const settingsStore = useSettingsStore();
const { getSettings, setSettings } = settingsStore;
const { settings } = storeToRefs(settingsStore);

onMounted(async () => {
  const info = await getSettings(true);
});

async function saveSettings() {
  try {
    await setSettings(settings.value);
  } catch (error) {
    ElMessage({
      message: `save failed! ${error}`,
      type: "error",
    });
  }
  ElMessage({
    message: `successfully saved!`,
    type: `success`,
  });
}
</script>

<template>
  <div>
    <el-button
      type="primary"
      :icon="Setting"
      @click="
        () => {
          dialogTableVisible = !dialogTableVisible;
        }
      "
      >Settings</el-button
    >
    <el-dialog
      v-model="dialogTableVisible"
      title="Shipping address"
      width="800"
    >
      <el-form :model="settings" label-width="auto" style="max-width: 600px">
        <el-form-item label="Base path">
          <el-input v-model="settings.basePath"></el-input>
        </el-form-item>
        <el-form-item label="CivitAI token">
          <el-input v-model="settings.civitaiToken"></el-input>
        </el-form-item>
        <el-form-item label="Http Proxy">
          <el-input v-model="settings.httpProxy"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSettings">Save</el-button>
          <el-button type="info" @click="getSettings(true)">Restore</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
