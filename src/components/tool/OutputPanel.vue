<script setup>
import { computed } from 'vue'
import { highlightJson } from '@/utils/highlight'
import { escapeHtml } from '@/utils/text'
import { useClipboard } from '@/composables/useClipboard'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorNotice from './ErrorNotice.vue'

const props = defineProps({
  output: { type: String, default: '' },
  /** { title, message, loc } | null */
  error: { type: Object, default: null },
  /** json | text */
  lang: { type: String, default: 'json' },
  actionLabel: { type: String, default: '执行' },
})

const { copied, writeText } = useClipboard()

const hasOutput = computed(() => !props.error && props.output !== '')

const highlighted = computed(() => {
  if (!props.output) return ''
  return props.lang === 'json' ? highlightJson(props.output) : escapeHtml(props.output)
})

const gutterText = computed(() => {
  if (!props.output) return ''
  const count = props.output.split('\n').length
  return Array.from({ length: count }, (_, i) => i + 1).join('\n')
})

const copy = () => writeText(props.output)
</script>

<template>
  <section class="pane">
    <header class="pane__head">
      <span class="pane__title">输出</span>
      <span class="pane__spacer" />
      <AppButton v-if="hasOutput" @click="copy">{{ copied ? '已复制' : '复制结果' }}</AppButton>
    </header>

    <ErrorNotice v-if="error" :error="error" :action-label="actionLabel" />

    <div v-if="hasOutput" class="pane__body">
      <div class="code-wrap">
        <pre class="code-gutter" aria-hidden="true">{{ gutterText }}</pre>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <pre class="code" v-html="highlighted" />
      </div>
    </div>

    <div v-if="!hasOutput && !error" class="empty">
      <div class="empty__icon">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <div class="empty__title">结果将显示在这里</div>
      <div class="empty__sub">在左侧输入内容，点击「{{ actionLabel }}」按钮</div>
      <div class="empty__hint">快捷键 Ctrl / ⌘ + Enter</div>
    </div>
  </section>
</template>

<style scoped>
.pane {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-panel);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-panel);
}

.pane__head {
  flex: 0 0 auto;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 16px;
  background: var(--c-panel-soft);
  border-bottom: 1px solid var(--c-border);
}

.pane__title {
  font-size: var(--fs-sm);
  font-weight: 650;
  letter-spacing: 0.4px;
  color: var(--c-text-2);
}

.pane__spacer {
  flex: 1 1 auto;
}

.pane__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.code-wrap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  overflow: auto;
}

.code-gutter {
  position: sticky;
  left: 0;
  flex: 0 0 auto;
  margin: 0;
  padding: 16px 10px 16px 16px;
  border-right: 1px solid #f0f1f4;
  background: var(--c-panel);
  color: #b9c0cb;
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  line-height: 1.7;
  text-align: right;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.code {
  flex: 1 1 auto;
  margin: 0;
  padding: 16px 20px 16px 12px;
  color: #24292f;
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  line-height: 1.7;
  white-space: pre;
  tab-size: 2;
}

.empty {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--c-text-3);
  text-align: center;
}

.empty__icon {
  width: 42px;
  height: 42px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #f3f4f8;
  color: #b3bac5;
}

.empty__title {
  font-size: var(--fs-code);
  font-weight: 600;
  color: var(--c-text-2);
}

.empty__sub {
  max-width: 280px;
  font-size: var(--fs-sm);
  line-height: 1.65;
}

.empty__hint {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: #b3bac5;
}
</style>
