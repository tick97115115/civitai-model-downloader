<script setup lang="ts">
import type { ModelId, ModelsRequestOpts } from "@shared/types/models_endpoint";
import { models_response } from "@shared/types/models_endpoint";
import { validate_all_records } from "@shared/types/models/__test__/load_data_list";
import { type } from "arktype";
import { ElMessage } from "element-plus";
import { ref } from "vue";
import ky from "ky";
import { fa } from "element-plus/es/locale/index.mjs";

const loading = ref(false);

async function print() {
    console.log("23");
}

const input3 = ref("");
const select = ref("");
const MODELS_ENDPOINT = "https://civitai.com/api/v1/models";

const model_ids = ref<Array<ModelId>>([]);
const next_page = ref<null | string>(null);

async function search(opts: ModelsRequestOpts = {}) {
    loading.value = true;
    const gallery_ele = document.querySelector("#gallery") as HTMLElement;
    gallery_ele.scrollTop = 0;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(opts)) {
        if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
        } else {
            params.append(key, String(value));
        }
    }
    const res = await ky.get(MODELS_ENDPOINT, {
        searchParams: params,
        mode: "cors",
    });
    if (!res.ok) {
        return ElMessage({
            message: res.statusText,
            type: "warning",
        });
    }
    const json = await res.json();
    const data = models_response(json);
    if (data instanceof type.errors) {
        // hover out.summary to see validation errors
        return ElMessage({
            message: data.summary,
            type: "warning",
        });
    } else {
        model_ids.value = data.items;
        next_page.value = data.metadata.nextPage ?? null;
        console.log(next_page.value);
    }
    loading.value = false;
}

async function load() {
    loading.value = true;
    if (next_page.value === null) {
        await search();

        loading.value = false;
        return;
    }
    const res = await ky.get(next_page.value);
    if (!res.ok) {
        ElMessage({
            message: res.statusText,
            type: "warning",
        });
    }
    const json = await res.json();
    const data = models_response(json);
    if (data instanceof type.errors) {
        // hover out.summary to see validation errors
        ElMessage({
            message: data.summary,
            type: "warning",
        });
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
    <el-container>
        <!-- <el-header>Header</el-header> -->
        <el-main v-loading="loading" style="overflow: hidden">
            <el-row
                id="gallery"
                :gutter="10"
                v-infinite-scroll="load"
                infinite-scroll-distance="50"
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
                    <el-card shadow="hover">
                        <template #header>{{ model_id.name }}</template>
                        <video
                            v-if="
                                model_id.modelVersions[0]?.images[0]?.type !==
                                'image'
                            "
                            style="width: 100%"
                            autoplay
                            loop
                            :src="
                                model_id.modelVersions[0]?.images[0]?.url ??
                                null
                            "
                        ></video>
                        <img
                            v-else
                            loading="lazy"
                            :src="
                                model_id.modelVersions[0]?.images[0]?.url ??
                                null
                            "
                            style="width: 100%"
                        />
                    </el-card>
                </el-col>
            </el-row>
        </el-main>

        <!-- <el-divider style="margin: 0%" /> -->

        <el-footer class="footer">
            <el-input
                v-model="input3"
                placeholder="Please input"
                class="input-with-select searchbar"
            >
                <template #prepend>
                    <el-select
                        v-model="select"
                        placeholder="Select"
                        style="width: 115px"
                    >
                        <el-option label="Restaurant" value="1" />
                        <el-option label="Order No." value="2" />
                        <el-option label="Tel" value="3" />
                    </el-select>
                </template>
                <template #append>
                    <el-button @click="search()">
                        <template #icon>
                            <el-icon><Search /></el-icon> </template
                    ></el-button>
                </template>
            </el-input>
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
.searchbar {
    max-width: 600px;
}
</style>
