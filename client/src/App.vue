<script setup lang="ts">
import type { ModelId } from "@shared/types/models_endpoint";
import {
  models_response,
  models_request_opts,
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

const loading = ref(false);

const MODELS_ENDPOINT = "https://civitai.com/api/v1/models";

const model_ids = ref<Array<ModelId>>([]);
const next_page = ref<null | string>(null);

const out = models_request_opts({
  token: "d250ad5b931cd1ab4895b66ae2d42149",
  nsfw: true,
});
if (out instanceof type.errors) {
  throw new Error("search params invalid!");
}
const search_params = reactive(out);
const infiniteScrollDisabled = ref(true);
async function search() {
  loading.value = true;
  const gallery_ele = document.querySelector("#gallery") as HTMLElement;
  gallery_ele.scrollTop = 0;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search_params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  }
  try {
    const res = await ky.get(MODELS_ENDPOINT, {
      searchParams: params,
      mode: "cors",
      timeout: 40000,
      // retry: {}
    });

    if (!res.ok) {
      ElMessage({
        message: res.statusText,
        type: "warning",
      });
      loading.value = false;
      return;
    }
    const json = await res.json();
    const data = models_response(json);

    if (data instanceof type.errors) {
      // hover out.summary to see validation errors
      ElMessage({
        message: data.summary,
        type: "warning",
      });
      loading.value = false;
    } else {
      model_ids.value = data.items;
      next_page.value = data.metadata.nextPage ?? null;
      console.log(next_page.value);
    }
    loading.value = false;
    infiniteScrollDisabled.value = false;
  } catch (error) {
    ElMessage({
      message: String(error),
      type: "warning",
    });

    loading.value = false;
    throw error;
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
  const res = await ky.get(next_page.value);
  if (!res.ok) {
    ElMessage({
      message: res.statusText,
      type: "warning",
    });
    loading.value = false;
    return;
  }
  const json = await res.json();
  const data = models_response(json);
  if (data instanceof type.errors) {
    // hover out.summary to see validation errors
    ElMessage({
      message: data.summary,
      type: "warning",
    });
    loading.value = false;
    return;
  }
  if (data.items[0].id === model_ids.value[model_ids.value.length - 1].id) {
    data.items.shift();
  }

  model_ids.value.push(...data.items);
  next_page.value = data.metadata.nextPage ?? null;
  loading.value = false;
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
      <DownloadsView></DownloadsView>
      <Searchbar :search="search" :search_params="search_params"></Searchbar>
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
