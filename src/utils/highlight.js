import { escapeHtml } from './text'

// 一次扫描完成分词：字符串（含转义）/ 键名 / 布尔 / null / 数字
const TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

/**
 * JSON 语法高亮：返回可直接 v-html 的字符串。
 * 先整体转义再着色，保证用户输入无法注入标签。
 */
export function highlightJson(text) {
  if (!text) return ''
  return escapeHtml(text).replace(TOKEN_RE, (match, str, colon) => {
    if (str) {
      const cls = colon ? 'tok-key' : 'tok-str'
      return `<span class="${cls}">${str}</span>${colon || ''}`
    }
    if (match === 'true' || match === 'false') {
      return `<span class="tok-bool">${match}</span>`
    }
    if (match === 'null') {
      return `<span class="tok-null">${match}</span>`
    }
    return `<span class="tok-num">${match}</span>`
  })
}
