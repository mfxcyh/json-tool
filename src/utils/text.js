/**
 * HTML 转义。
 * 所有要经 v-html 渲染的用户内容，必须先过这一层，避免 XSS。
 */
export function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
