<script setup lang="ts">
import type { ModelId } from "@shared/types/models_endpoint";
import {
  models_response,
  models_request_opts,
  MODELS_ENDPOINT,
} from "@shared/types/models_endpoint";
import { type } from "arktype";
import { ElMessage } from "element-plus";
import { ref, reactive } from "vue";
import ky from "ky";
import ModelDetailCard from "./components/ModelDetailCard.vue";
import Searchbar from "./components/Searchbar.vue";
// import { storeToRefs } from "pinia";
import ModelCard from "@/components/ModelCard.vue";
import DownloadsView from "@/views/DownloadsView.vue";
import SettingsView from "@/views/SettingsView.vue";
import { useSettingsStore } from "@/stores/settings";
import { storeToRefs } from "pinia";
import { trpcClient } from "./utils/trpcClient";
import DbRefreshButton from "./components/DbRefreshButton.vue";

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const loading = ref(false);
const model_ids = ref<Array<ModelId>>([]);
const next_page = ref<null | string>(null);

const out = models_request_opts({});
if (out instanceof type.errors) {
  throw new Error("search params invalid!");
}
const search_params = reactive(out);
const infiniteScrollDisabled = ref(true);
async function search() {
  // loading
  loading.value = true;

  // scroll back to top position
  const gallery_ele = document.querySelector("#gallery") as HTMLElement;
  gallery_ele.scrollTop = 0;

  // send request
  const res = await trpcClient.civitaiApi.models.mutate(search_params);

  if (res.code === 200) {
    ElMessage({
      message: res.message,
      type: "success",
    });
    const data = res.data!;

    model_ids.value = data.items;
    next_page.value = data.metadata.nextPage ?? null;
    console.log(next_page.value);

    loading.value = false;
    infiniteScrollDisabled.value = false;
    return;
  } else {
    // hover out.summary to see validation errors
    ElMessage({
      message: res.message,
      type: "warning",
    });
    loading.value = false;
  }
}

async function load() {
  console.log("load more");
  loading.value = true;
  if (next_page.value === null) {
    loading.value = false;
    infiniteScrollDisabled.value = true;
    console.log("No more data can be loaded.");
    return;
  }

  const res = await trpcClient.civitaiApi.modelsLoadMore.query({
    next: next_page.value,
  });
  if (res.code === 200) {
    const data = res.data!;
    if (data.items[0].id === model_ids.value[model_ids.value.length - 1].id) {
      data.items.shift();
    }
    model_ids.value.push(...data.items);
    next_page.value = data.metadata.nextPage ?? null;
    loading.value = false;
  } else {
    ElMessage({
      message: res.message,
      type: "warning",
    });
    loading.value = false;
    return;
  }
}
</script>

<template>
  <el-container style="height: 100vh">
    <!-- <el-header>Header</el-header> -->
    <el-main v-loading="loading" style="overflow: hidden">
      <el-row
        id="gallery"
        :gutter="10"
        v-infinite-scroll="load"
        :infinite-scroll-disabled="infiniteScrollDisabled"
        infinite-scroll-distance="50"
        infinite-scroll-immediate="false"
        style="overflow: auto; height: 86vh"
      >
        <el-col
          :xs="8"
          :sm="6"
          :md="5"
          :lg="4"
          :xl="3"
          v-for="model_id in model_ids"
          :key="model_id.id"
        >
          <ModelCard :model-id="model_id"></ModelCard>
        </el-col>
      </el-row>
    </el-main>

    <!-- <el-divider style="margin: 0%" /> -->

    <el-footer class="footer">
      <ModelDetailCard></ModelDetailCard>

      <DbRefreshButton></DbRefreshButton>
      <DownloadsView></DownloadsView>
      <Searchbar :search="search" :search_params="search_params"></Searchbar>
      <SettingsView></SettingsView>
    </el-footer>
  </el-container>
</template>

<style lang="scss" scoped>
.footer {
  max-height: 50px;
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: start;
}
</style>
