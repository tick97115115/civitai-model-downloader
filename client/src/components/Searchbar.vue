<script setup lang="ts">
import { reactive, ref } from "vue";
import { ModelsRequestOpts } from "@shared/types/models_endpoint";
import { User, Key } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  model_types,
  models_request_sort,
  models_request_period,
} from "@shared/types/baseModels/misc";

defineProps<{
  search(): Promise<void>;
  search_params: ModelsRequestOpts;
}>();

type arkUnites = Array<arkUnit>;

type arkUnit = {
  unit: string;
};

const searchBarFocused = ref(false);

function focusOnSearch() {
  searchBarFocused.value = true;
}
</script>

<template>
  <div>
    <el-popover trigger="click" width="400">
      <template #reference>
        <el-input
          placeholder="Please input"
          v-model="search_params.query"
          class="input-with-select searchbar"
          @focus=""
        >
          <!-- <template #prepend>
          <el-select v-model="select" placeholder="Select" style="width: 115px">
            <el-option label="Restaurant" value="1" />
            <el-option label="Order No." value="2" />
            <el-option label="Tel" value="3" />
          </el-select>
        </template> -->
          <template #append>
            <el-button @click="search()">
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
            v-for="item in model_types.json as arkUnites"
            :key="item['unit']"
            :label="item['unit']"
            :value="item['unit']"
          >
            {{ item["unit"] }}
            ></el-option
          >
        </el-select>
        <el-input
          :prefix-icon="User"
          v-model="search_params.username"
          placeholder="Username"
        >
          <template #append>
            <el-button @click="search()">
              <template #icon>
                <el-icon><Search /></el-icon> </template
            ></el-button>
          </template>
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
            v-for="item in models_request_period.json as arkUnites"
            :key="item['unit']"
            :label="item['unit']"
            :value="item['unit']"
            >{{ item["unit"] }}</el-option
          > </el-select
        ><el-select
          placeholder="Sort"
          v-model="search_params.sort"
          :teleported="false"
        >
          <el-option
            v-for="item in models_request_sort.json as arkUnites"
            :key="item['unit']"
            :label="item['unit']"
            :value="item['unit']"
            >{{ item["unit"] }}</el-option
          >
        </el-select>
        <el-input
          :prefix-icon="Key"
          v-model="search_params.token"
          placeholder="Token"
        ></el-input>
        <!-- <el-button
          @click="
            () => {
              console.log(search_params);
            }
          "
        ></el-button> -->
      </el-space>
    </el-popover>
  </div>
</template>

<style>
.searchbar {
  max-width: 600px;
}
</style>
