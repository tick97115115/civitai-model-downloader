import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { models_request_opts } from "@shared/types/models_endpoint";
import { type } from "arktype";

export const useSearchParamsStore = defineStore('counter', () => {
  const out = models_request_opts({})
  if (out instanceof type.errors) {
    throw new Error('search params invalid!')
  }
  const search_params = reactive(out);

  return { search_params }
})