<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { getTool, getGroupName } from '@/config/navigation'
import { SNIPPETS } from '@/config/snippets'
import { locateError, parseJsonSafe } from '@/utils/json'
import ToolHeader from '@/components/tool/ToolHeader.vue'
import InputPanel from '@/components/tool/InputPanel.vue'
import OutputPanel from '@/components/tool/OutputPanel.vue'
import SnippetPanel from '@/components/tool/SnippetPanel.vue'

/** 超过这个体量就不做实时校验，否则每次按键都要全量 parse */
const LIVE_CHECK_LIMIT = 200000

const props = defineProps({
  /** 工具 id，与 TOOLS 注册表对应 */
  toolId: { type: String, required: true },
})

const tool = computed(() => getTool(props.toolId))
const groupName = computed(() => getGroupName(props.toolId))
/** 工具附带的独立 JS 源码（没有则为 null，不渲染面板） */
const snippet = computed(() => SNIPPETS[props.toolId] || null)

const input = ref('')
const output = ref('')
const error = ref(null)
/** 双向工具（如编解码）的当前方向；单向工具保持空串 */
const mode = ref('')

/** 当前方向的定义；单向工具为 null */
const activeMode = computed(() => {
  const modes = tool.value?.modes
  if (!modes || !modes.length) return null
  return modes.find((item) => item.key === mode.value) || modes[0]
})

/** 真正执行用哪个转换函数 */
const activeTransform = computed(
  () => activeMode.value?.transform || tool.value?.transform || null,
)

/** 按钮与提示文案：双向工具跟随方向，单向工具用工具自身文案 */
const actionLabel = computed(() => activeMode.value?.label || tool.value?.action || '')

/** 输入框底部的实时合法性徽标（仅 JSON 类工具） */
const check = computed(() => {
  if (!tool.value || tool.value.lang !== 'json') return null
  const text = input.value.trim()
  if (!text) return null
  if (text.length > LIVE_CHECK_LIMIT) {
    return { state: 'idle', text: '文本过大，跳过实时校验' }
  }
  const { error: parseError } = parseJsonSafe(text)
  return parseError
    ? { state: 'err', text: 'JSON 语法不合法' }
    : { state: 'ok', text: 'JSON 语法合法' }
})

function resetResult() {
  output.value = ''
  error.value = null
}

function run() {
  resetResult()
  const transform = activeTransform.value
  if (!transform) return

  const text = input.value.trim()
  if (!text) {
    error.value = { title: '输入为空', message: '请先粘贴或输入需要处理的内容', loc: null }
    return
  }

  try {
    output.value = transform(text)
  } catch (err) {
    const isSyntaxError = err instanceof SyntaxError
    error.value = {
      title: isSyntaxError ? 'JSON 解析失败' : `${actionLabel.value || '处理'}失败`,
      message: err.message,
      loc: isSyntaxError ? locateError(text, err.message) : null,
    }
  }
}

async function fillSample() {
  input.value = activeMode.value?.sample || tool.value?.sample || ''
  // input 的 watch 会清空旧结果，等这一轮 flush 结束后再执行，否则结果会被清掉
  await nextTick()
  run()
}

function clearAll() {
  input.value = ''
  resetResult()
}

// 输入一变，旧结果即过期，先清掉，避免误读
watch(input, resetResult)

// 切换方向（编码/解码等）后，输入与上一方向的结果一并作废
watch(mode, () => {
  input.value = ''
  resetResult()
})
</script>

<template>
  <div v-if="tool" class="tool-view">
    <ToolHeader :tool="tool" :group-name="groupName" />

    <div class="tool-view__main">
      <InputPanel
        v-model="input"
        v-model:mode="mode"
        :tool="tool"
        :check="check"
        :action-label="actionLabel"
        @run="run"
        @sample="fillSample"
        @clear="clearAll"
      />
      <OutputPanel
        :output="output"
        :error="error"
        :lang="activeMode?.lang || tool.lang"
        :action-label="actionLabel"
      />
    </div>

    <SnippetPanel v-if="snippet" :code="snippet" />
  </div>
</template>

<style scoped>
.tool-view {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tool-view__main {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 14px;
  padding: 0 20px 18px;
}

@media (max-width: 960px) {
  .tool-view__main {
    flex-direction: column;
    height: auto;
    gap: 12px;
    padding: 0 14px 16px;
  }

  .tool-view__main > * {
    min-height: 300px;
  }
}
</style>
