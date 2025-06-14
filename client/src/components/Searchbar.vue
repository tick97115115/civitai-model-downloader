<script setup lang="ts">
import { reactive, ref } from "vue";
import { ModelsRequestOpts } from "@shared/types/models_endpoint";
import { User, Key } from "@element-plus/icons-vue";
import { trpcClient } from "@/utils/trpcClient";
import { ElMessage } from "element-plus";
import {
  model_types,
  models_request_sort,
  models_request_period,
  ModelTypesArray,
  ModelsRequestPeriodArray,
  ModelsRequestSortArray,
  BaseModelsArray,
} from "@shared/types/baseModels/misc";

defineProps<{
  search(params: ModelsRequestOpts): Promise<void>;
  search_params: ModelsRequestOpts;
}>();

const tags = ref<string[]>([]);

const remoteMethod = async (query: string) => {
  if (query) {
    // loading.value = true

    tags.value = await trpcClient.tags.searchTag.query({ tag: query });
    // loading.value = false
  } else {
    tags.value = [];
  }
};
</script>

<template>
  <div>
    <el-popover trigger="click" width="400">
      <template #reference>
        <el-input
          placeholder="Please input"
          v-model="search_params.query"
          class="searchbar"
          @keyup.enter="search(search_params)"
        >
          <!-- <template #prepend>
          <el-select v-model="select" placeholder="Select" style="width: 115px">
            <el-option label="Restaurant" value="1" />
            <el-option label="Order No." value="2" />
            <el-option label="Tel" value="3" />
          </el-select>
        </template> -->
          <template #append>
            <el-button @click="search(search_params)">
              <template #icon>
                <el-icon><Search /></el-icon> </template
            ></el-button>
          </template>
        </el-input>
      </template>

      <el-space style="width: 100%" direction="vertical" :fill="true">
        <el-select
          v-model="search_params.types"
          clearable
          :teleported="false"
          multiple
          placeholder="content types"
        >
          <el-option
            v-for="item in ModelTypesArray"
            :key="item"
            :label="item"
            :value="item"
          >
            {{ item }}
            ></el-option
          >
        </el-select>

        <el-select
          v-model="search_params.baseModels"
          clearable
          :teleported="false"
          multiple
          placeholder="base model types"
        >
          <el-option
            v-for="item in BaseModelsArray"
            :key="item"
            :label="item"
            :value="item"
          >
            {{ item }}
            ></el-option
          >
        </el-select>

        <el-select
          v-model="search_params.tag"
          clearable
          :teleported="false"
          allow-create
          filterable
          reserve-keyword
          :remote-method="remoteMethod"
          multiple
          remote
          placeholder="Tags"
        >
          <el-option
            v-for="item in tags"
            :key="item"
            :label="item"
            :value="item"
          >
            {{ item }}
            ></el-option
          >
        </el-select>

        <el-input
          :prefix-icon="User"
          v-model="search_params.username"
          placeholder="Username"
        >
        </el-input>
        <div>
          <el-checkbox label="NSFW" v-model="search_params.nsfw"></el-checkbox>
          <el-checkbox
            label="Favorites"
            v-model="search_params.favorites"
          ></el-checkbox>
          <el-checkbox
            label="Hidden"
            v-model="search_params.hidden"
          ></el-checkbox>
        </div>
        <el-select
          placeholder="Period"
          v-model="search_params.period"
          :teleported="false"
        >
          <el-option
            v-for="item in ModelsRequestPeriodArray"
            :key="item"
            :label="item"
            :value="item"
            >{{ item }}</el-option
          > </el-select
        ><el-select
          placeholder="Sort"
          v-model="search_params.sort"
          :teleported="false"
        >
          <el-option
            v-for="item in ModelsRequestSortArray"
            :key="item"
            :label="item"
            :value="item"
            >{{ item }}</el-option
          >
        </el-select>
        <el-input
          :prefix-icon="Key"
          v-model="search_params.token"
          placeholder="Token"
        ></el-input>
      </el-space>
    </el-popover>
  </div>
</template>

<style>
.searchbar {
  max-width: 600px;
}
</style>
