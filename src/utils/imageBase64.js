/**
 * 图片 ⇄ Base64（data URI）互转。
 *
 * 约定：
 * - 输出统一带 data URI 前缀（data:image/xxx;base64,…），可直接放进 <img src> 或 CSS
 * - 反向解析接受完整 data URI 或裸 base64（自动去空白/换行）；
 *   裸 base64 通过魔数嗅探类型，认不出时按 image/png 处理（浏览器对 data URI 实际会自行嗅探）
 * - 常见格式：PNG / JPEG / GIF / WebP / BMP / SVG
 */

/** base64 前缀 → [mime, 扩展名]；注意 BMP 的 "Qk" 只有两位，放最后兜底 */
const MAGIC = [
  ['iVBORw0KGgo', 'image/png', 'png'],
  ['/9j/', 'image/jpeg', 'jpg'],
  ['R0lGOD', 'image/gif', 'gif'],
  ['UklGR', 'image/webp', 'webp'],
  ['PHN2Z', 'image/svg+xml', 'svg'],
  ['Qk', 'image/bmp', 'bmp'],
]

export function sniffImageMime(b64) {
  for (const [prefix, mime] of MAGIC) {
    if (b64.startsWith(prefix)) return mime
  }
  return 'image/png'
}

export function mimeToExt(mime) {
  const hit = MAGIC.find(([, m]) => m === mime)
  if (hit) return hit[2]
  if (mime === 'image/x-icon') return 'ico'
  if (mime === 'image/avif') return 'avif'
  return 'png'
}

/** base64 字符串对应的真实字节数（去掉 padding 损耗） */
export function base64Bytes(b64) {
  const padding = (b64.match(/=+$/) || [''])[0].length
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding)
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * 任意文本 → 图片 data URI。
 * 返回 { mime, ext, dataUri, base64, bytes }；空串返回 null；非法抛 Error。
 */
export function parseBase64Image(text) {
  const raw = String(text).trim()
  if (!raw) return null

  let mime = null
  let b64 = raw

  if (/^data:/i.test(raw)) {
    const match = /^data:([^;,]*)(;base64)?,([\s\S]*)$/i.exec(raw)
    if (!match) throw new Error('不是合法的 data URI：应为 data:image/png;base64,xxxx 形式')
    mime = match[1] && match[1].startsWith('image/') ? match[1].toLowerCase() : null
    if (!match[2]) throw new Error('该 data URI 不是 base64 编码（缺少 ;base64 标记）')
    b64 = match[3]
  }

  // 容忍粘贴时带的换行与空格
  b64 = b64.replace(/\s+/g, '')
  if (!b64) return null
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) {
    throw new Error('不是合法的 Base64：只允许 A-Z a-z 0-9 + / = 这些字符')
  }

  const finalMime = mime || sniffImageMime(b64)
  return {
    mime: finalMime,
    ext: mimeToExt(finalMime),
    dataUri: `data:${finalMime};base64,${b64}`,
    base64: b64,
    bytes: base64Bytes(b64),
  }
}

/**
 * 图片文件 → data URI。返回 Promise<{ name, type, size, dataUri }>；
 * 非图片类型抛 Error。
 */
export function imageFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(png|jpe?g|gif|webp|bmp|svg|ico|avif)$/i.test(file.name || '')
    if (!isImage) {
      reject(new Error(`不是图片文件：${file.name || '未知文件'}（仅支持 PNG/JPEG/GIF/WebP/BMP/SVG/ICO/AVIF）`))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || '')
      const match = /^data:[^;,]*(;base64)?,([\s\S]*)$/i.exec(raw)
      if (!match) {
        reject(new Error('文件读取失败，请重试'))
        return
      }
      // FileReader 对未知类型会给 application/octet-stream，这里统一按
      // file.type（若为图片）或魔数嗅探重建 data URI，保证结果可用
      const b64 = match[2]
      const mime =
        file.type && file.type.startsWith('image/') ? file.type : sniffImageMime(b64)
      resolve({
        name: file.name || '',
        type: file.type || mime,
        size: file.size || 0,
        dataUri: `data:${mime};base64,${b64}`,
      })
    }
    reader.onerror = () => reject(new Error('文件读取失败，请重试'))
    reader.readAsDataURL(file)
  })
}
