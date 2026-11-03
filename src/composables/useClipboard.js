import { onBeforeUnmount, ref } from 'vue'

/**
 * 复制到剪贴板。
 * navigator.clipboard 在 http 非安全上下文下不可用，退回 execCommand 兜底。
 */
export function useClipboard({ resetDelay = 1600 } = {}) {
  const copied = ref(false)
  let timer = null

  async function writeText(text) {
    if (!text) return false

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const helper = document.createElement('textarea')
      helper.value = text
      helper.setAttribute('readonly', '')
      helper.style.position = 'fixed'
      helper.style.top = '-9999px'
      document.body.appendChild(helper)
      helper.select()
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      document.body.removeChild(helper)
      if (!ok) return false
    }

    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, resetDelay)
    return true
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { copied, writeText }
}
