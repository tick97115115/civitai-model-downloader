<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  search(): Promise<any>;
}>();
</script>

<template>
  <el-input placeholder="Please input" class="input-with-select searchbar">
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

<style>
.searchbar {
  max-width: 600px;
}
</style>
