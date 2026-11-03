/**
 * 颜色格式换算：HEX ⇄ RGB ⇄ HSL。
 *
 * 约定：
 * - HEX 支持 #RGB 与 #RRGGBB，输出统一 #RRGGBB 大写
 * - rgb() / rgba() 都能解析（rgba 的 alpha 参与="#"忽略，因为 HEX/RGB/HSL 三者都不带透明度）
 * - HSL 按标准色相柱公式换算，h ∈ [0,360)，s/l ∈ [0,100]
 */

export function clampChannel(n) {
  return Math.min(255, Math.max(0, Math.round(Number(n) || 0)))
}

export function rgbToHex(r, g, b) {
  const to2 = (n) => clampChannel(n).toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase()
}

export function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim())
  if (!match) throw new Error('不是合法的 HEX 颜色：应为 #RGB 或 #RRGGBB，例如 #4F46E5')
  const s = match[1]
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** 允许全角/半角逗号；rgba() 的 alpha 位可有可无（解析时忽略） */
export function parseRgbText(text) {
  const match = /^rgba?\(\s*(\d{1,3})\s*[,，]\s*(\d{1,3})\s*[,，]\s*(\d{1,3})\s*(?:[,，]\s*(?:0?\.\d+|1(?:\.0+)?)\s*)?\)$/i.exec(
    String(text).trim(),
  )
  if (!match) throw new Error('不是合法的 RGB 颜色：应为 rgb(255, 87, 51) 形式')
  const channels = [match[1], match[2], match[3]].map(Number)
  if (channels.some((n) => n > 255)) throw new Error('RGB 通道值超出范围（0–255）')
  return { r: channels[0], g: channels[1], b: channels[2] }
}

/**
 * 任意文本 → RGB。接受 #HEX / rgb() / rgba()；
 * 合法返回 {r,g,b}，空串返回 null（供输入框边打字边判断，不打扰），非法抛 Error。
 */
export function parseColorText(text) {
  const raw = String(text).trim()
  if (!raw) return null
  if (raw.startsWith('#')) return hexToRgb(raw)
  if (/^rgba?\(/i.test(raw)) return parseRgbText(raw)
  throw new Error('支持 #HEX 或 rgb() 格式，例如 #4F46E5 或 rgb(79, 70, 229)')
}

export function rgbToHsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** 按相对亮度挑黑/白前景色，保证色块上的文字可读 */
export function readableTextColor(r, g, b) {
  const lum =
    0.2126 * (r / 255) ** 2.2 + 0.7152 * (g / 255) ** 2.2 + 0.0722 * (b / 255) ** 2.2
  return lum > 0.55 ? '#1f2328' : '#ffffff'
}
