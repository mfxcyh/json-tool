/**
 * 把原生 JSON.parse 的错误换算成可读的行列位置。
 * V8 的报错形如：Unexpected token } in JSON at position 12 (line 2 column 3)
 * 不同浏览器文案有差异，因此优先用 position 自行计算。
 */
export function locateError(text, message) {
  const matched = /position\s+(\d+)/i.exec(message || '')
  if (!matched) return null

  const pos = Math.min(Number(matched[1]), text.length)
  const before = text.slice(0, pos)
  const line = before.split('\n').length
  const col = pos - before.lastIndexOf('\n')
  const lineText = text.split('\n')[line - 1] || ''

  return {
    line,
    col,
    lineText,
    // 0 基列索引，供模板标出出错字符
    offset: Math.max(col - 1, 0),
  }
}

/**
 * 安全解析：不抛错，返回统一的 { data, error } 结构。
 */
export function parseJsonSafe(text) {
  try {
    return { data: JSON.parse(text), error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err.message, loc: locateError(text, err.message) },
    }
  }
}
