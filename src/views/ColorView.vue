<script setup>
import { computed, ref } from 'vue'
import { getTool, getGroupName } from '@/config/navigation'
import { hexToRgb, parseColorText, readableTextColor, rgbToHex, rgbToHsl } from '@/utils/color'
import { useClipboard } from '@/composables/useClipboard'
import AppButton from '@/components/ui/AppButton.vue'
import ToolHeader from '@/components/tool/ToolHeader.vue'

const tool = getTool('color-convert')
const groupName = getGroupName('color-convert')

/** 唯一事实源：RGB 三个通道；其余格式全部派生 */
const rgb = ref({ r: 79, g: 70, b: 229 })
const hexText = ref('#4F46E5')
const rgbText = ref('rgb(79, 70, 229)')
const errText = ref('')

const hexCopied = useClipboard()
const rgbCopied = useClipboard()
const hslCopied = useClipboard()

const hexValue = computed(() => rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b))
const rgbValue = computed(() => `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`)
const hsl = computed(() => rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b))
const hslValue = computed(() => `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`)
const swatchColor = computed(() => hexValue.value.toLowerCase())
const swatchText = computed(() => readableTextColor(rgb.value.r, rgb.value.g, rgb.value.b))

function apply(next, source) {
  rgb.value = next
  if (source !== 'hex') hexText.value = hexValue.value
  if (source !== 'rgb') rgbText.value = rgbValue.value
  errText.value = ''
}

function onHexInput() {
  try {
    const next = parseColorText(hexText.value)
    if (next) apply(next, 'hex')
  } catch (err) {
    errText.value = err.message
  }
}

function onRgbInput() {
  try {
    const next = parseColorText(rgbText.value)
    if (next) apply(next, 'rgb')
  } catch (err) {
    errText.value = err.message
  }
}

function onPickerInput(event) {
  try {
    apply(hexToRgb(event.target.value), 'picker')
  } catch {
    /* 原生拾色器的值一定是合法 HEX，这里只是兜底 */
  }
}
</script>

<template>
  <div class="color-view">
    <ToolHeader :tool="tool" :group-name="groupName" />

    <div class="color-view__main">
      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">拾色器</span>
        </header>

        <div class="pane__body picker">
          <label class="picker__swatch" :style="{ background: swatchColor, color: swatchText }">
            <span class="picker__hex">{{ hexValue }}</span>
            <input
              type="color"
              class="picker__native"
              :value="hexValue"
              aria-label="颜色选择器"
              @input="onPickerInput"
            />
          </label>
          <p class="picker__hint">点击色块打开系统拾色器；下方的值也可以直接改，互相联动。</p>
        </div>
      </section>

      <section class="pane">
        <header class="pane__head">
          <span class="pane__title">格式与转换</span>
          <span class="pane__spacer" />
          <span v-if="errText" class="form-err">{{ errText }}</span>
        </header>

        <div class="pane__body form">
          <div class="form-row">
            <label class="form-row__label" for="hex-input">HEX</label>
            <input
              id="hex-input"
              v-model="hexText"
              class="form-row__input"
              type="text"
              spellcheck="false"
              placeholder="#4F46E5"
              @input="onHexInput"
            />
            <AppButton @click="hexCopied.writeText(hexValue)">
              {{ hexCopied.copied.value ? '已复制' : '复制' }}
            </AppButton>
          </div>

          <div class="form-row">
            <label class="form-row__label" for="rgb-input">RGB</label>
            <input
              id="rgb-input"
              v-model="rgbText"
              class="form-row__input"
              type="text"
              spellcheck="false"
              placeholder="rgb(79, 70, 229)"
              @input="onRgbInput"
            />
            <AppButton @click="rgbCopied.writeText(rgbValue)">
              {{ rgbCopied.copied.value ? '已复制' : '复制' }}
            </AppButton>
          </div>

          <div class="form-row">
            <label class="form-row__label" for="hsl-field">HSL</label>
            <input
              id="hsl-field"
              class="form-row__input form-row__input--readonly"
              type="text"
              :value="hslValue"
              readonly
            />
            <AppButton @click="hslCopied.writeText(hslValue)">
              {{ hslCopied.copied.value ? '已复制' : '复制' }}
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.color-view {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.color-view__main {
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

.pane__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 拾色器 */
.picker {
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 22px;
}

.picker__swatch {
  position: relative;
  width: 100%;
  max-width: 340px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease;
}

.picker__swatch:hover {
  transform: scale(1.01);
}

.picker__hex {
  font-family: var(--font-mono);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1px;
  pointer-events: none;
}

/* 原生 input[type=color] 铺满色块但完全透明，点击即弹系统拾色器 */
.picker__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.picker__hint {
  max-width: 340px;
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--c-text-3);
  text-align: center;
}

/* 格式行 */
.form {
  gap: 12px;
  padding: 18px 16px;
  justify-content: flex-start;
}

.form-err {
  font-size: var(--fs-xs);
  color: #d03050;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-row__label {
  flex: 0 0 44px;
  font-size: var(--fs-sm);
  font-weight: 650;
  color: var(--c-text-2);
}

.form-row__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: #fbfbfd;
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  color: var(--c-text);
}

.form-row__input:focus {
  outline: none;
  border-color: var(--c-accent);
  background: #fff;
}

.form-row__input--readonly {
  color: var(--c-text-2);
  background: #f6f7f9;
}

@media (max-width: 960px) {
  .color-view__main {
    flex-direction: column;
    height: auto;
    gap: 12px;
    padding: 0 14px 16px;
  }

  .pane {
    min-height: 220px;
  }
}
</style>
