/**
 * JSON ⇄ XML 互转。
 *
 * 约定（与常见 xml2js / json2xml 工具对齐，往返转换尽量不丢信息）：
 * - JSON → XML：对象属性 → 子元素；数组 → 同名重复元素；标量 → 文本内容；
 *   null → 空元素；顶层数组用 <root><item>…</item></root> 包裹
 * - XML → JSON：属性 → "@属性名"；重复兄弟元素 → 数组；纯文本元素 → 字符串；
 *   文本与子元素混排时文本进 "#text"；一切值均为字符串（XML 本身无类型）
 *
 * JSON 输入非法时透传原生 SyntaxError（页面会做行列定位）；
 * XML 输入非法时抛普通 Error（页面显示通用错误提示）。
 */

/** XML 文本节点转义（& < > 三个即可） */
function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** XML 属性值转义（额外处理引号） */
function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;')
}

/**
 * 把 JSON key 规整成合法 XML 标签名：
 * 中文与字母数字下划线点横线保留，其余字符替换为 "_"；
 * 数字或符号开头时补 "_" 前缀（XML 标签名不能以数字、点、横线开头）。
 */
function safeTag(name) {
  const tag = String(name).replace(/[^\w.\-\u4E00-\u9FFF]/g, '_')
  return /^[A-Za-z_\u4E00-\u9FFF]/.test(tag) ? tag : `_${tag}`
}

/** 单个节点转 XML；返回值不含首尾多余空行 */
function nodeToXml(name, value, depth) {
  const pad = '  '.repeat(depth)
  const tag = safeTag(name)

  if (value === null || value === undefined) {
    return `${pad}<${tag}/>`
  }

  // 数组：同名重复元素
  if (Array.isArray(value)) {
    return value.map((item) => nodeToXml(name, item, depth)).join('\n')
  }

  // 对象：子元素
  if (typeof value === 'object') {
    const children = Object.entries(value)
      .map(([key, val]) => nodeToXml(key, val, depth + 1))
      .join('\n')
    return children ? `${pad}<${tag}>\n${children}\n${pad}</${tag}>` : `${pad}<${tag}/>`
  }

  // 标量：文本内容
  return `${pad}<${tag}>${escapeText(value)}</${tag}>`
}

export function jsonToXml(text) {
  const raw = String(text).trim()
  if (!raw) throw new Error('输入为空，请先粘贴 JSON 内容')

  // SyntaxError 有意透传：页面会解析出「第 N 行第 M 列」
  const data = JSON.parse(raw)
  const header = '<?xml version="1.0" encoding="UTF-8"?>'

  if (Array.isArray(data)) {
    const items = data.map((item) => nodeToXml('item', item, 1)).join('\n')
    return `${header}\n<root>\n${items}\n</root>`
  }
  return `${header}\n${nodeToXml('root', data, 0)}`
}

/** 提取 parsererror 里第一行有意义的报错，太长就截断 */
function firstErrorLine(text) {
  const line = String(text)
    .split('\n')
    .map((part) => part.trim())
    .find(Boolean)
  return line ? (line.length > 120 ? `${line.slice(0, 120)}…` : line) : '未知语法错误'
}

/** 元素 → JSON 值（属性进 @attr，重复兄弟进数组，纯文本元素直接给字符串） */
function elementToJson(el) {
  const result = {}

  for (const attr of Array.from(el.attributes)) {
    result[`@${attr.name}`] = attr.value
  }

  for (const child of Array.from(el.children)) {
    const value = elementToJson(child)
    const key = child.tagName
    if (key in result) {
      // 同名兄弟元素 → 数组
      if (Array.isArray(result[key])) result[key].push(value)
      else result[key] = [result[key], value]
    } else {
      result[key] = value
    }
  }

  // 只统计直接子文本节点（textContent 会混入子孙元素的文本）
  const ownText = Array.from(el.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue)
    .join('')
    .trim()

  if (ownText) {
    if (Object.keys(result).length === 0) return ownText
    result['#text'] = ownText
  }

  if (Object.keys(result).length === 0) return ''
  return result
}

export function xmlToJson(text) {
  const raw = String(text).trim()
  if (!raw) throw new Error('输入为空，请先粘贴 XML 内容')

  const doc = new DOMParser().parseFromString(raw, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`不是合法的 XML：${firstErrorLine(parserError.textContent)}`)
  }

  const root = doc.documentElement
  if (!root) throw new Error('不是合法的 XML：未找到根元素')

  return JSON.stringify({ [root.tagName]: elementToJson(root) }, null, 2)
}
