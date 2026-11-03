/**
 * URL 编解码 —— 独立可用版本。
 * 本文件内容会以纯文本形式展示在「URL 编解码」工具页的源码面板中，
 * 复制出去（去掉本注释头）即可直接粘贴使用。
 */

/**
 * URL 编码（按 encodeURIComponent 规则，除 A-Z a-z 0-9 - _ . ! ~ * ' ( ) 外全部转义）
 */
function urlEncode(text) {
  return encodeURIComponent(text)
}

/**
 * URL 解码（%XX 序列不完整时给出可读报错，而不是静默乱码）
 */
function urlDecode(text) {
  try {
    return decodeURIComponent(text)
  } catch {
    throw new Error('不是合法的 URL 编码：存在不完整的 %XX 序列')
  }
}
