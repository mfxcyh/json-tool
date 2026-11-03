/**
 * Base64 编解码 —— 独立可用版本。
 * 本文件内容会以纯文本形式展示在「Base64 编解码」工具页的源码面板中，
 * 复制出去（去掉本注释头）即可直接粘贴使用。
 */

/**
 * Base64 编码（UTF-8 安全；btoa 只认 Latin-1，直接编中文会乱码，
 * 所以先走 TextEncoder 转字节）
 */
function base64Encode(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

/**
 * Base64 解码
 * - 自动清理粘贴时带的换行/空格
 * - 兼容 URL-safe 变体（- 和 _ 会还原成 + 和 /）
 * - 中文等 UTF-8 内容正常还原；解出来是二进制时也不报错
 */
function base64Decode(input) {
  const cleaned = String(input)
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  if (!cleaned) {
    throw new Error('输入为空，请先粘贴 Base64 字符串')
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('不是合法的 Base64：只允许 A-Z a-z 0-9 + / = 这些字符')
  }

  let binary
  try {
    binary = atob(cleaned)
  } catch {
    throw new Error('不是合法的 Base64：字符数或末尾填充（=）不正确')
  }

  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  try {
    // fatal 模式下遇到非法 UTF-8 会抛错，用于识别非文本内容
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes)
  }
}
