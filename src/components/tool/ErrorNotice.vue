<script setup>
import { computed } from 'vue'
import { escapeHtml } from '@/utils/text'

const props = defineProps({
  /** { title, message, loc: { line, col, lineText, offset } | null } */
  error: { type: Object, required: true },
  actionLabel: { type: String, default: '执行' },
})

// 把出错位置的字符直接标红，比单独画插入符好读
const snippetHtml = computed(() => {
  const loc = props.error.loc
  if (!loc) return ''

  const text = loc.lineText || ''
  const index = loc.offset
  const before = escapeHtml(text.slice(0, index))
  const at = escapeHtml(text.slice(index, index + 1)) || '&nbsp;'
  const after = escapeHtml(text.slice(index + 1))

  return `${before}<span class="err-mark">${at}</span>${after}`
})
</script>

<template>
  <div class="error-box">
    <div class="error-box__head">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12.5" />
        <line x1="12" y1="16" x2="12" y2="16.01" />
      </svg>
      <div>
        <div class="error-box__title">{{ error.title }}</div>
        <div class="error-box__msg">{{ error.message }}</div>
      </div>
    </div>

    <div v-if="error.loc" class="error-box__loc">
      <div class="error-box__chips">
        <span class="error-box__chip">第 {{ error.loc.line }} 行</span>
        <span class="error-box__chip">第 {{ error.loc.col }} 列</span>
        <span>出错位置如下</span>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <pre class="error-box__snippet" v-html="snippetHtml" />
    </div>

    <div class="error-box__foot">修正后重新点击「{{ actionLabel }}」按钮即可</div>
  </div>
</template>

<style scoped>
.error-box {
  flex: 0 0 auto;
  margin: 12px 14px 0;
  padding: 12px 14px;
  border: 1px solid var(--c-err-border);
  border-radius: var(--r-md);
  background: var(--c-err-soft);
}

.error-box__head {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.error-box__head svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--c-err);
}

.error-box__title {
  font-size: 14px;
  font-weight: 650;
  line-height: 1.5;
  color: var(--c-err);
}

.error-box__msg {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: #a1232b;
  word-break: break-word;
}

.error-box__loc {
  margin-top: 10px;
  padding-top: 9px;
  border-top: 1px dashed #f0c4c6;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: #7d2930;
}

.error-box__chips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.error-box__chip {
  padding: 1px 6px;
  border: 1px solid #f0c4c6;
  border-radius: 4px;
  background: #fff;
  font-weight: 600;
  color: var(--c-err);
}

.error-box__snippet {
  margin: 0;
  padding: 8px 10px;
  overflow-x: auto;
  border: 1px solid #f2d3d5;
  border-radius: var(--r-sm);
  background: #fff;
  color: #6c2b31;
  line-height: 1.6;
  white-space: pre;
}

.error-box__snippet :deep(.err-mark) {
  padding: 0 1px;
  border-bottom: 2px solid var(--c-err);
  border-radius: 2px;
  background: #ffe3e3;
  color: #9d1c24;
  font-weight: 700;
}

.error-box__foot {
  margin-top: 9px;
  font-size: 12.5px;
  color: #a0565c;
}
</style>
