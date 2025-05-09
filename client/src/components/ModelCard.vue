<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useModelDetailStore } from "@/stores/modelDetail";
import { ModelId } from "@shared/types/models_endpoint";
import { trpcClient } from "@/utils/trpcClient";

const props = defineProps<{
  modelId: ModelId;
}>();

const haveNewUpdate = ref<boolean>(false);
const hasNewest = ref<boolean>(false);
onMounted(async () => {
  const info = await trpcClient.checkIfModelIdOnDiskAndIfLatest.mutate({
    modelId: props.modelId,
  });
  haveNewUpdate.value = info.onDisk && !info.hasNewest;
  hasNewest.value = info.hasNewest;
});

const modelDetailStore = useModelDetailStore();
// const { modelId, modelDetailCardDisplay } = storeToRefs(modelDetailStore);
const { setModelId, setModelDetailCardDisplay } = modelDetailStore;
</script>

<template>
  <el-card
    shadow="hover"
    @click="
      setModelDetailCardDisplay(true);
      setModelId(modelId);
    "
  >
    <template #header>{{ modelId.name }}</template>
    <video
      v-if="modelId.modelVersions[0]?.images[0]?.type !== 'image'"
      style="width: 100%"
      autoplay
      loop
      :src="modelId.modelVersions[0]?.images[0]?.url ?? null"
    ></video>
    <el-image
      v-else
      lazy
      :src="modelId.modelVersions[0]?.images[0]?.url ?? null"
      fit="cover"
    />
    <template #footer>
      <el-tag effect="dark" type="primary">{{
        `${modelId.modelVersions[0]?.baseModel}: ${modelId.modelVersions[0]?.baseModelType}`
      }}</el-tag>
      <el-tag v-if="haveNewUpdate" type="warning">Have new version!</el-tag>
      <el-tag v-if="hasNewest" type="success">Up to date~</el-tag>
    </template>
  </el-card>
</template>
