<script setup lang="ts">
import { Download } from "@element-plus/icons-vue";
import { ref } from "vue";
import { gopeedClient } from "@/utils/gopeedClient";
import { ElMessage } from "element-plus";
import * as _ from "lodash";

const dialogTableVisible = ref(false);

async function clearGopeedTasks() {
  const tasks = await gopeedClient.getTasks();
  await gopeedClient.deleteTasks(
    _.map(tasks, (task) => task.id),
    [],
    [],
    false
  );
  ElMessage({
    message: `tasks all cleared.`,
    type: "success",
  });
}
</script>

<template>
  <div>
    <el-button
      type="primary"
      :icon="Download"
      @click="dialogTableVisible = !dialogTableVisible"
      >Downloads Management</el-button
    >
    <el-dialog
      v-model="dialogTableVisible"
      title="Shipping address"
      width="800"
    >
      <el-button @click="clearGopeedTasks">Clear download tasks</el-button>
    </el-dialog>
  </div>
</template>
