<script setup>
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  tool: { type: Object, required: true },
  /** { state: 'ok' | 'err' | 'idle', text: string } | null */
  check: { type: Object, default: null },
  /** 双向工具的当前方向（编码 / 解码），单向工具为空 */
  mode: { type: String, default: '' },
  /** 主按钮文案，跟随方向变化 */
  actionLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:mode', 'run', 'sample', 'clear'])

const stats = computed(() => {
  const text = props.modelValue || ''
  return {
    chars: text.length,
    lines: text ? text.split('\n').length : 0,
  }
})

const badge = computed(() => props.check || { state: 'idle', text: '等待输入' })

const canRun = computed(() => Boolean(props.modelValue.trim()))

/** 是否显示编码/解码切换 */
const hasModes = computed(() => Array.isArray(props.tool.modes) && props.tool.modes.length > 1)

const buttonText = computed(() => props.actionLabel || props.tool.action)

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <section class="pane">
    <header class="pane__head">
      <span class="pane__title">输入</span>

      <div v-if="hasModes" class="mode-switch" role="group" aria-label="转换方向">
        <button
          v-for="item in tool.modes"
          :key="item.key"
          type="button"
          class="mode-switch__btn"
          :class="{ 'mode-switch__btn--active': item.key === mode }"
          @click="emit('update:mode', item.key)"
        >
          {{ item.label }}
        </button>
      </div>

      <span class="pane__spacer" />
      <AppButton variant="ghost" @click="emit('sample')">示例</AppButton>
      <AppButton variant="ghost" @click="emit('clear')">清空</AppButton>
    </header>

    <div class="pane__body">
      <textarea
        class="input-area"
        :value="modelValue"
        :placeholder="tool.placeholder"
        spellcheck="false"
        @input="onInput"
        @keydown.ctrl.enter.prevent="emit('run')"
        @keydown.meta.enter.prevent="emit('run')"
      />
    </div>

    <footer class="pane__foot">
      <span class="pane__stat">
        <b>{{ stats.chars }}</b> 字符 · <b>{{ stats.lines }}</b> 行
      </span>
      <span class="pane__spacer" />
      <StatusBadge :state="badge.state" :text="badge.text" />
      <AppButton
        variant="primary"
        :disabled="!canRun"
        title="快捷键：Ctrl / ⌘ + Enter"
        @click="emit('run')"
      >
        {{ buttonText }}
      </AppButton>
    </footer>
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

/* 编码 / 解码 分段切换 */
.mode-switch {
  display: inline-flex;
  gap: 2px;
  margin-left: 6px;
  padding: 2px;
  border-radius: 7px;
  background: #eceef2;
}

.mode-switch__btn {
  padding: 3px 13px;
  border-radius: 5px;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--c-text-3);
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}

.mode-switch__btn:hover {
  color: var(--c-text-2);
}

.mode-switch__btn--active {
  background: #fff;
  color: var(--c-accent);
  box-shadow: 0 1px 2px rgba(20, 25, 35, 0.08);
}

.pane__spacer {
  flex: 1 1 auto;
}

.pane__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.input-area {
  flex: 1 1 auto;
  width: 100%;
  padding: 16px 18px;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  line-height: 1.7;
  tab-size: 2;
}

.input-area::placeholder {
  color: #b3bac5;
}

.pane__foot {
  flex: 0 0 auto;
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 0 16px;
  background: var(--c-panel-soft);
  border-top: 1px solid var(--c-border);
}

.pane__stat {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.pane__stat b {
  color: var(--c-text-2);
  font-weight: 600;
}
</style>
