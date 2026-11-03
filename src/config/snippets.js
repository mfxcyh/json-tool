/**
 * 工具页附带的独立 JS 源码注册表：toolId → 源码文本。
 *
 * 每个工具的源码是 src/snippets/ 下的独立 .js 文件（真实文件、可编辑、
 * 有语法高亮），通过 Vite 的 ?raw 导入为字符串展示在源码面板中。
 * 新工具要挂源码：在 src/snippets/ 建文件 → 下面 import 一行 → 注册一条。
 */

import encodeBase64Snippet from '@/snippets/encode-base64.js?raw'
import encodeUrlSnippet from '@/snippets/encode-url.js?raw'

export const SNIPPETS = {
  'encode-base64': encodeBase64Snippet,
  'encode-url': encodeUrlSnippet,
}
