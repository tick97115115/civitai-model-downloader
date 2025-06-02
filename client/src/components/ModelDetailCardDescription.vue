<template>
  <div ref="shadowHost"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Props {
  externalHtml: string;
}

const props = defineProps<Props>();
const shadowHost = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!shadowHost.value) return;

  const shadowRoot = shadowHost.value.attachShadow({ mode: "open" });

  // 添加强制样式覆盖
  const style = document.createElement("style");
  style.textContent = `
    :host {
      display: block;
      contain: content;
    }
    
    /* 强制覆盖所有元素的内联样式 */
    * {
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    /* 特定元素增强样式 */
    p, div, span, td, th, li {
      min-width: 0 !important; /* 解决flex/grid布局中的换行问题 */
    }
    
    /* 处理长单词和URL */
    a {
      word-break: break-all !important;
    }
  `;

  shadowRoot.appendChild(style);
  shadowRoot.innerHTML += props.externalHtml;
});
</script>
