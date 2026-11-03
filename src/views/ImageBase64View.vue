<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getTool, getGroupName } from '@/config/navigation'
import {
  formatBytes,
  imageFileToBase64,
  parseBase64Image,
} from '@/utils/imageBase64'
import { useClipboard } from '@/composables/useClipboard'
import AppButton from '@/components/ui/AppButton.vue'
import ToolHeader from '@/components/tool/ToolHeader.vue'

const tool = getTool('image-base64')
const groupName = getGroupName('image-base64')

/** 与文本工具的 编码/解码 切换一致：tab 只换方向，不换页面 */
const MODES = [
  { key: 'to-b64', label: '图片 → Base64' },
  { key: 'to-img', label: 'Base64 → 图片' },
]
const mode = ref('to-b64')

/* ---------- 方向一：图片 → Base64 ---------- */
const fileResult = ref(null) // { name, type, size, dataUri }
const fileError = ref('')
const dragOver = ref(false)
const fileInput = ref(null)
const outCopied = useClipboard()
const rawCopied = useClipboard()

const rawBase64 = computed(() => {
  const idx = fileResult.value?.dataUri.indexOf(',') ?? -1
  return idx >= 0 ? fileResult.value.dataUri.slice(idx + 1) : ''
})

function acceptFile(file) {
  fileError.value = ''
  if (!file) return
  imageFileToBase64(file)
    .then((result) => {
      fileResult.value = result
    })
    .catch((err) => {
      fileResult.value = null
      fileError.value = err.message
    })
}

function onFileChange(event) {
  acceptFile(event.target.files?.[0])
  event.target.value = '' // 允许重复选同一个文件
}

function onDrop(event) {
  dragOver.value = false
  acceptFile(event.dataTransfer?.files?.[0])
}

/** 全局粘贴：截图后 Ctrl+V 直接转 */
function onPaste(event) {
  if (mode.value !== 'to-b64') return
  const item = Array.from(event.clipboardData?.items || []).find((i) =>
    i.type.startsWith('image/'),
  )
  if (item) acceptFile(item.getAsFile())
}

onMounted(() => document.addEventListener('paste', onPaste))
onBeforeUnmount(() => document.removeEventListener('paste', onPaste))

/* ---------- 方向二：Base64 → 图片 ---------- */
const b64Text = ref('')
const b64Error = ref('')
const imgBroken = ref(false)

const parsed = computed(() => {
  b64Error.value = ''
  imgBroken.value = false
  try {
    return parseBase64Image(b64Text.value)
  } catch (err) {
    b64Error.value = err.message
    return null
  }
})

function onImgError() {
  imgBroken.value = true
}

function download() {
  if (!parsed.value) return
  const link = document.createElement('a')
  link.href = parsed.value.dataUri
  link.download = `image.${parsed.value.ext}`
  link.click()
}

function clearCurrent() {
  if (mode.value === 'to-b64') {
    fileResult.value = null
    fileError.value = ''
  } else {
    b64Text.value = ''
  }
}
</script>

<template>
  <div class="img-view">
    <ToolHeader :tool="tool" :group-name="groupName" />

    <div class="img-view__main">
      <!-- 输入 -->
      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">输入</span>

          <div class="mode-switch" role="group" aria-label="转换方向">
            <button
              v-for="item in MODES"
              :key="item.key"
              type="button"
              class="mode-switch__btn"
              :class="{ 'mode-switch__btn--active': item.key === mode }"
              @click="mode = item.key"
            >
              {{ item.label }}
            </button>
          </div>

          <span class="pane__spacer" />
          <AppButton variant="ghost" @click="clearCurrent">清空</AppButton>
        </header>

        <div class="pane__body">
          <!-- 图片 → Base64：拖放区 -->
          <div
            v-if="mode === 'to-b64'"
            class="drop"
            :class="{ 'drop--over': dragOver }"
            role="button"
            tabindex="0"
            aria-label="选择或拖入图片文件"
            @click="fileInput?.click()"
            @keydown.enter="fileInput?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="drop__input"
              @change="onFileChange"
            />
            <template v-if="fileResult">
              <img class="drop__preview" :src="fileResult.dataUri" alt="预览" />
              <div class="drop__name">{{ fileResult.name || '剪贴板图片' }} · {{ formatBytes(fileResult.size) }}</div>
            </template>
            <template v-else>
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <div class="drop__title">点击选择 / 拖入图片 / 直接 Ctrl+V 粘贴截图</div>
              <div class="drop__sub">PNG · JPEG · GIF · WebP · BMP · SVG · ICO · AVIF</div>
            </template>
          </div>

          <!-- Base64 → 图片：文本输入 -->
          <textarea
            v-else
            v-model="b64Text"
            class="code-in"
            spellcheck="false"
            placeholder="粘贴 data:image/png;base64,xxxx 或裸 Base64 字符串（支持带换行）"
          ></textarea>
        </div>
      </section>

      <!-- 输出 -->
      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">输出</span>
          <span class="pane__spacer" />
          <span v-if="mode === 'to-b64' && fileError" class="pane__err">{{ fileError }}</span>
          <span v-if="mode === 'to-img' && b64Error" class="pane__err">{{ b64Error }}</span>
        </header>

        <div class="pane__body pane__body--pad">
          <!-- 图片 → Base64 的结果 -->
          <template v-if="mode === 'to-b64'">
            <template v-if="fileResult">
              <textarea
                class="code-out"
                :value="fileResult.dataUri"
                readonly
                spellcheck="false"
              ></textarea>
              <div class="meta">
                {{ fileResult.type }} · 原始 {{ formatBytes(fileResult.size) }} → Base64 约
                {{ formatBytes(Math.ceil((rawBase64.length * 3) / 4)) }}
              </div>
              <div class="actions">
                <AppButton @click="outCopied.writeText(fileResult.dataUri)">
                  {{ outCopied.copied.value ? '已复制' : '复制 Data URI' }}
                </AppButton>
                <AppButton @click="rawCopied.writeText(rawBase64)">
                  {{ rawCopied.copied.value ? '已复制' : '复制纯 Base64' }}
                </AppButton>
              </div>
            </template>
            <div v-else class="empty">
              <div class="empty__title">结果将显示在这里</div>
              <div class="empty__sub">在左侧选择或粘贴图片，自动转为 Base64</div>
            </div>
          </template>

          <!-- Base64 → 图片的结果 -->
          <template v-else>
            <template v-if="parsed">
              <div v-if="imgBroken" class="decode__broken">
                图片解码失败：Base64 内容可能不完整或已损坏
              </div>
              <img
                v-else
                class="decode__img"
                :src="parsed.dataUri"
                alt="解码预览"
                @error="onImgError"
              />
              <div class="meta">{{ parsed.mime }} · {{ formatBytes(parsed.bytes) }}</div>
              <div class="actions">
                <AppButton @click="download">下载图片（.{{ parsed.ext }}）</AppButton>
              </div>
            </template>
            <div v-else class="empty">
              <div class="empty__title">预览将显示在这里</div>
              <div class="empty__sub">在左侧粘贴 Base64，自动解码为图片</div>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.img-view {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.img-view__main {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 14px;
  padding: 0 20px 18px;
}

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

/* 与文本工具一致的 分段切换 */
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

.pane__err {
  font-size: var(--fs-xs);
  color: #d03050;
}

.pane__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.pane__body--pad {
  gap: 10px;
  padding: 14px;
  overflow: auto;
}

/* 拖放区 */
.drop {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px;
  padding: 18px;
  border: 1.5px dashed var(--c-border);
  border-radius: 10px;
  color: var(--c-text-3);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.drop:hover,
.drop--over {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);
}

.drop__input {
  display: none;
}

.drop__preview {
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
}

.drop__name {
  font-size: var(--fs-xs);
  font-family: var(--font-mono);
}

.drop__title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text-2);
}

.drop__sub {
  font-size: var(--fs-xs);
  font-family: var(--font-mono);
}

/* 文本框 */
.code-in,
.code-out {
  flex: 1 1 auto;
  min-height: 120px;
  width: 100%;
  resize: none;
  border: 0;
  outline: none;
  padding: 16px 18px;
  background: transparent;
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  line-height: 1.6;
  color: var(--c-text);
}

.code-out {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: #fbfbfd;
  white-space: pre-wrap;
  word-break: break-all;
}

.meta {
  flex: 0 0 auto;
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  font-family: var(--font-mono);
}

.actions {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}

/* 空态与结果 */
.empty {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--c-text-3);
  text-align: center;
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

.decode__img {
  align-self: center;
  max-width: 100%;
  max-height: 240px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background:
    conic-gradient(#eee 0 25%, #fff 0 50%, #eee 0 75%, #fff 0) 0 0/16px 16px;
}

.decode__broken {
  align-self: center;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fdf0f2;
  color: #d03050;
  font-size: var(--fs-sm);
}

@media (max-width: 960px) {
  .img-view__main {
    flex-direction: column;
    height: auto;
    gap: 12px;
    padding: 0 14px 16px;
  }

  .pane {
    min-height: 260px;
  }
}
</style>
