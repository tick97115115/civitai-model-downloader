import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const query = ref("");
  const limit =ref(20);
  // const page = ref(1);
  const tag = ref('')
  const username = ref('')
  

  return { search_text: query }
})