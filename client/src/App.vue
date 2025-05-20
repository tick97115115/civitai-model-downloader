<script setup lang="ts">
import type { ModelId, ModelsRequestOpts } from "@shared/types/models_endpoint";
import { ElMessage } from "element-plus";
import { ref, reactive, toRefs, toRaw } from "vue";
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
import type {
  LocalModelsRequestOpts,
  LocalModelsResponse,
} from "@shared/types/local/trpc_models";

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const isLocal = ref(true);
const loading = ref(false);
const civitai_model_ids = ref<Array<ModelId>>([]);
const next_page = ref<null | string>(null);

const civitai_search_params = reactive<ModelsRequestOpts>({});
const infiniteScrollDisabled = ref(true);
async function searchCivitAI(params: ModelsRequestOpts) {
  // loading
  loading.value = true;

  // scroll back to top position
  const gallery_ele = document.querySelector("#gallery") as HTMLElement;
  gallery_ele.scrollTop = 0;

  // send request
  const res = await trpcClient.civitaiApi.models.mutate(params);

  if (res.code === 200) {
    ElMessage({
      message: res.message,
      type: "success",
    });
    const data = res.data!;

    civitai_model_ids.value = data.items;
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

async function loadCivitAI() {
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
    if (
      data.items[0].id ===
      civitai_model_ids.value[civitai_model_ids.value.length - 1].id
    ) {
      data.items.shift();
    }
    civitai_model_ids.value.push(...data.items);
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

// Local - Start
const local_search_params = reactive<LocalModelsRequestOpts>({
  limit: 20,
  page: 1,
});
const local_search_params_for_jump = ref<LocalModelsRequestOpts>({
  limit: 20,
  page: 1,
});
const local_model_ids = ref<Array<ModelId>>([]);
const local_total_count = ref<number>(1);
const local_total_page_number = ref<number>(1);
const local_page_size = ref<number>(1);
const local_current_page = ref<number>(1);

function changeStatesAfterLocalSearch(result: LocalModelsResponse) {
  local_model_ids.value = result.items;

  local_total_count.value = result.metadata.totalItems;
  local_total_page_number.value = result.metadata.totalPages;
  local_page_size.value = result.metadata.pageSize;
  local_current_page.value = result.metadata.currentPage;
}

async function searchLocal(params: LocalModelsRequestOpts) {
  params.page = 1;

  // clone a paramter for jump use, avoid unexpected error.
  local_search_params_for_jump.value = structuredClone(toRaw(params));

  const result = await trpcClient.modelId.findLocalModels.mutate(params);
  changeStatesAfterLocalSearch(result);
  console.log("query trpc models");
}

async function localJumpTo(page: number) {
  if (page > local_total_page_number.value) {
    ElMessage({
      message: `You cant jump out of range!`,
      type: "warning",
    });
    return;
  }
  local_search_params_for_jump.value.page = page;
  const result = await trpcClient.modelId.findLocalModels.mutate(
    local_search_params_for_jump.value
  );
  changeStatesAfterLocalSearch(result);
  console.log(`jump to ${result.metadata.currentPage}`);
}
</script>

<template>
  <el-container style="height: 100vh">
    <!-- <el-header>Header</el-header> -->
    <el-main style="padding-top: 0">
      <!-- Local -->
      <div v-show="isLocal" style="height: 100%">
        <el-container style="height: 100%">
          <el-main style="overflow: auto">
            <el-row :gutter="10">
              <el-col
                :xs="8"
                :sm="6"
                :md="5"
                :lg="4"
                :xl="3"
                v-for="model_id in local_model_ids"
                :key="model_id.id"
              >
                <ModelCard :model-id="model_id"></ModelCard>
              </el-col>
            </el-row>
          </el-main>
          <el-footer style="height: auto">
            <el-pagination
              style="justify-content: center"
              background
              layout="prev, pager, next, jumper"
              :total="local_total_count"
              :current-page="local_current_page"
              :page-size="local_page_size"
              @current-change="localJumpTo"
            />
          </el-footer>
        </el-container>
      </div>

      <!-- CivitAI -->
      <el-row
        v-loading="loading"
        v-show="!isLocal"
        id="gallery"
        :gutter="10"
        v-infinite-scroll="loadCivitAI"
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
          v-for="model_id in civitai_model_ids"
          :key="model_id.id"
        >
          <ModelCard :model-id="model_id"></ModelCard>
        </el-col>
      </el-row>
    </el-main>

    <!-- <el-divider style="margin: 0%" /> -->

    <el-footer class="footer">
      <ModelDetailCard></ModelDetailCard>

      <el-switch
        v-model="isLocal"
        class="ml-2"
        inline-prompt
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #1970c2ff"
        active-text="Local"
        inactive-text="CivitAI"
      />
      <DbRefreshButton></DbRefreshButton>

      <Searchbar
        v-if="isLocal"
        :search="searchLocal"
        :search_params="local_search_params"
      ></Searchbar>
      <Searchbar
        v-else
        :search="searchCivitAI"
        :search_params="civitai_search_params"
      ></Searchbar>
      <DownloadsView></DownloadsView>
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
