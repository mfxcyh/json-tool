<script setup>
import { computed, ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'
import AppButton from '../ui/AppButton.vue'

const props = defineProps({
  /** 独立可用的 JS 源码 */
  code: { type: String, default: '' },
})

const open = ref(false)
const { copied, writeText } = useClipboard()

const lineCount = computed(() => props.code.split('\n').length)
</script>

<template>
  <section class="snippet">
    <header class="snippet__head">
      <button
        type="button"
        class="snippet__toggle"
        :aria-expanded="open"
        @click="open = !open"
      >
        <svg
          class="snippet__chevron"
          :class="{ 'snippet__chevron--open': open }"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>JS 源码（独立可用，粘贴即用）</span>
        <span class="snippet__meta">{{ lineCount }} 行</span>
      </button>
      <span class="snippet__spacer" />
      <AppButton @click="writeText(code)">{{ copied ? '已复制' : '复制源码' }}</AppButton>
    </header>

    <pre v-show="open" class="snippet__code">{{ code }}</pre>
  </section>
</template>

<style scoped>
.snippet {
  flex: 0 0 auto;
  margin: 0 20px 18px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  background: var(--c-panel);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
}

.snippet__head {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 10px;
  background: var(--c-panel-soft);
}

.snippet__toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 7px;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--c-text-2);
  transition: background 0.15s, color 0.15s;
}

.snippet__toggle:hover {
  background: #f3f4f7;
  color: var(--c-text);
}

.snippet__chevron {
  color: var(--c-text-3);
  transition: transform 0.18s ease;
}

.snippet__chevron--open {
  transform: rotate(90deg);
}

.snippet__meta {
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.snippet__spacer {
  flex: 1 1 auto;
}

.snippet__code {
  margin: 0;
  padding: 14px 18px;
  background: #fbfbfd;
  border-top: 1px solid var(--c-border);
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  line-height: 1.7;
  color: var(--c-text);
  white-space: pre;
  /* 固定限高：最多占视口 60%，超出内部滚动，不把面板挤出屏幕 */
  max-height: 60vh;
  overflow: auto;
  tab-size: 2;
}
</style>
