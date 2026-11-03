/**
 * UTF-8 安全的 Base64 编解码（btoa 只认 Latin-1，中文会炸）。
 */

export function base64Encode(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

export function base64Decode(input) {
  // 粘贴时经常带换行/空格，先清掉；同时兼容 URL-safe 变体（- 和 _）
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
    // fatal 为 true 时遇到非法 UTF-8 会抛错，便于给出可读提示
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    // 解出来不是文本（多半是二进制），退回宽松解码，别让用户白等
    return new TextDecoder('utf-8').decode(bytes)
  }
}

export function urlEncode(text) {
  return encodeURIComponent(text)
}

export function urlDecode(text) {
  try {
    return decodeURIComponent(text)
  } catch {
    throw new Error('不是合法的 URL 编码：存在不完整的 %XX 序列')
  }
}
