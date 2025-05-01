<script setup lang="ts">
import clipboard from "clipboardy";
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
import type { ModelId, ModelsRequestOpts } from "@shared/types/models_endpoint";
import { storeToRefs } from "pinia";
import { TabsPaneContext, ElMessage, ElNotification } from "element-plus";
import { useModelDetailStore } from "@/stores/modelDetail";
import { ref } from "vue";

const modelDetailStore = useModelDetailStore();
const { modelId, modelDetailCardDisplay, activeVersionId } =
  storeToRefs(modelDetailStore);
const { setModelId, setModelDetailCardDisplay } = modelDetailStore;

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
          <!-- <h2>{{ modelId?.name }}</h2> -->
          <a
            class="clickable-title"
            target="_blank"
            :href="`https://civitai.com/models/${modelId.id}`"
          ></a>
        </div>
      </template>
      <el-tabs
        class="demo-tabs"
        @tab-click="handleClick"
        v-model="activeVersionId"
      >
        <el-tab-pane
          v-for="modelVersion in modelId?.modelVersions"
          :key="modelVersion.id"
          :name="modelVersion.id"
        >
          <template #label>
            <span>{{ modelVersion.name }}</span>
          </template>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-image
                :src="modelVersion.images[0]?.url"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                show-progress
                :initial-index="0"
                :preview-src-list="
                  modelVersion.images.map((img, index) => img.url)
                "
                fit="contain"
                lazy
              />
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-space direction="vertical">
                <el-descriptions border title="Details" :column="1">
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
                      <b>Trigger Words</b>
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

                <el-button type="primary" round :icon="Download"
                  >Save Model</el-button
                >
                <el-button type="primary" round :icon="Picture"
                  >Save Images</el-button
                >
                <el-button type="primary" round :icon="Document"
                  >Save Info</el-button
                >
                <el-button type="success" round :icon="Box">Save All</el-button>
              </el-space>
            </el-col>
          </el-row>
        </el-tab-pane>
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
