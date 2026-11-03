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

/* ---------- 图片 → Base64 ---------- */
const fileResult = ref(null) // { name, type, size, dataUri }
const fileError = ref('')
const dragOver = ref(false)
const fileInput = ref(null)
const outCopied = useClipboard()
const rawCopied = useClipboard()

/** data URI 里裸 base64 部分（单独提供复制） */
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
  const item = Array.from(event.clipboardData?.items || []).find((i) =>
    i.type.startsWith('image/'),
  )
  if (item) acceptFile(item.getAsFile())
}

onMounted(() => document.addEventListener('paste', onPaste))
onBeforeUnmount(() => document.removeEventListener('paste', onPaste))

/* ---------- Base64 → 图片 ---------- */
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
</script>

<template>
  <div class="img-view">
    <ToolHeader :tool="tool" :group-name="groupName" />

    <div class="img-view__main">
      <!-- 图片 → Base64 -->
      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">图片 → Base64</span>
          <span class="pane__spacer" />
          <span v-if="fileError" class="pane__err">{{ fileError }}</span>
        </header>

        <div class="pane__body encode">
          <div
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

          <template v-if="fileResult">
            <div class="meta">
              {{ fileResult.name || '剪贴板图片' }} · {{ fileResult.type }} ·
              原始 {{ formatBytes(fileResult.size) }} → Base64 约
              {{ formatBytes(Math.ceil((rawBase64.length * 3) / 4)) }}
            </div>
            <textarea
              class="code-out"
              :value="fileResult.dataUri"
              readonly
              spellcheck="false"
            ></textarea>
            <div class="actions">
              <AppButton @click="outCopied.writeText(fileResult.dataUri)">
                {{ outCopied.copied.value ? '已复制' : '复制 Data URI' }}
              </AppButton>
              <AppButton @click="rawCopied.writeText(rawBase64)">
                {{ rawCopied.copied.value ? '已复制' : '复制纯 Base64' }}
              </AppButton>
            </div>
          </template>
        </div>
      </section>

      <!-- Base64 → 图片 -->
      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">Base64 → 图片</span>
          <span class="pane__spacer" />
          <span v-if="b64Error" class="pane__err">{{ b64Error }}</span>
        </header>

        <div class="pane__body decode">
          <textarea
            v-model="b64Text"
            class="code-in"
            spellcheck="false"
            placeholder="粘贴 data:image/png;base64,xxxx 或裸 Base64 字符串（支持带换行）"
          ></textarea>

          <template v-if="parsed">
            <div v-if="imgBroken" class="decode__broken">图片解码失败：Base64 内容可能不完整或已损坏</div>
            <img
              v-else
              class="decode__img"
              :src="parsed.dataUri"
              alt="解码预览"
              @error="onImgError"
            />
            <div class="meta">
              {{ parsed.mime }} · {{ formatBytes(parsed.bytes) }}
            </div>
            <div class="actions">
              <AppButton @click="download">下载图片（.{{ parsed.ext }}）</AppButton>
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
  gap: 10px;
  padding: 14px;
  overflow: auto;
}

/* 左栏：拖放区 */
.drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 170px;
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
  max-height: 150px;
  border-radius: 8px;
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

.meta {
  flex: 0 0 auto;
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  font-family: var(--font-mono);
}

.code-out,
.code-in {
  flex: 1 1 auto;
  min-height: 110px;
  width: 100%;
  resize: none;
  padding: 10px 12px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: #fbfbfd;
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  line-height: 1.6;
  color: var(--c-text);
}

.code-in:focus {
  outline: none;
  border-color: var(--c-accent);
  background: #fff;
}

.actions {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}

/* 右栏 */
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
