<script setup lang="ts">
import type { ModelId, ModelsRequestOpts } from "@shared/types/models_endpoint";
import { useModelDetailStore } from "@/stores/modelDetail";
const modelDetailStore = useModelDetailStore();
</script>

<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <h2>Model Detail</h2>
                <el-button @click="print">Print</el-button>
            </div>
        </template>
    </el-card>
</template>
