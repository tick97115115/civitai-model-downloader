<script setup lang="ts">
import { storeToRefs } from "pinia";
import { TabsPaneContext, ElMessage, ElNotification } from "element-plus";
import { useModelDetailStore } from "@/stores/modelDetail";

import { Client } from "@gopeed/rest";
import ModelDetailCardTabPane from "@/components/ModelDetailCardTabPane.vue";
const CivtAI_Token = "d250ad5b931cd1ab4895b66ae2d42149";
const gopeedClient = new Client({
  host: "http://127.0.0.1:9999",
  token: "",
});
const modelDetailStore = useModelDetailStore();
const { modelId, modelDetailCardDisplay, activeVersionId } =
  storeToRefs(modelDetailStore);

const handleClick = (tab: TabsPaneContext, event: Event) => {
  // console.log(tab, event);
};
</script>

<template>
  <el-dialog
    v-model="modelDetailCardDisplay"
    title="Shipping address"
    width="800"
  >
    <el-card v-if="modelId !== null">
      <template #header>
        <div class="card-header">
          <a
            class="clickable-title"
            target="_blank"
            :href="`https://civitai.com/models/${modelId.id}?modelVersionId=${activeVersionId}`"
            >{{ modelId.name }}</a
          >
        </div>
      </template>
      <el-tabs
        class="demo-tabs"
        @tab-click="handleClick"
        v-model="activeVersionId"
      >
        <ModelDetailCardTabPane
          :model-id="modelId"
          :-civt-a-i_-token="CivtAI_Token"
          :gopeed-client="gopeedClient"
        ></ModelDetailCardTabPane>
      </el-tabs>
    </el-card>
  </el-dialog>
</template>

<style>
.clickable-title {
  --gradient: linear-gradient(90deg, #3498db, #9b59b6);

  /* 使用系统默认无衬线字体栈 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  display: inline-block;
  padding-bottom: 1rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* 移除默认链接下划线 */
}

.clickable-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 4px;
  background: var(--gradient);
  transition: all 0.3s ease;
}

.clickable-title:hover::after {
  width: 100%;
}
</style>
