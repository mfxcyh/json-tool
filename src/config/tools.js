import { base64Decode, base64Encode, urlDecode, urlEncode } from '@/utils/encode'
import { jsonToXml, xmlToJson } from '@/utils/xml'

/**
 * 工具注册表 —— 新增工具只需在这里加一条，导航、路由、页面会自动接上。
 *
 * 字段说明：
 *   id          唯一标识，同时作为路由参数
 *   name        侧边栏与标题显示名
 *   desc        页面副标题
 *   action      主按钮文案
 *   lang        输出渲染方式：json（高亮）/ text（纯文本）
 *   placeholder 输入框占位符
 *   sample      示例内容
 *   transform   (text) => string，抛错即视为失败；JSON 相关工具请让原生
 *               SyntaxError 透出，页面据此做「解析失败 + 行列定位」
 */
export const TOOLS = {
  'json-format': {
    id: 'json-format',
    name: 'JSON 格式化',
    desc: '粘贴 JSON 字符串，一键缩进美化，输出带语法高亮与行号的结果',
    action: '格式化',
    lang: 'json',
    placeholder: '在此粘贴 JSON 字符串，例如 {"a":1,"b":[true,null]}',
    sample:
      '{"name":"牛马9527","role":"员工","skills":["JSON","Vue"],"active":true,"salary":null,"meta":{"level":3,"score":98.5}}',
    transform: (text) => JSON.stringify(JSON.parse(text), null, 2),
  },

  'json-minify': {
    id: 'json-minify',
    name: 'JSON 压缩',
    desc: '去除所有空白与换行，输出最小体积的单行 JSON',
    action: '压缩',
    lang: 'json',
    placeholder: '在此粘贴待压缩的 JSON 字符串',
    sample:
      '{\n  "name": "牛马9527",\n  "skills": ["JSON", "Vue"],\n  "active": true\n}',
    transform: (text) => JSON.stringify(JSON.parse(text)),
  },

  'json-escape': {
    id: 'json-escape',
    name: 'JSON 转义',
    desc: '把 JSON 文本转成可嵌入代码的转义字符串，转义前会先校验合法性',
    action: '转义',
    lang: 'json',
    placeholder: '在此粘贴需要转义的 JSON 字符串',
    sample:
      '{"name":"牛马9527","skills":["JSON","Vue"],"active":true,"meta":{"level":3}}',
    transform: (text) => {
      JSON.parse(text) // 先校验，非法直接抛 SyntaxError
      return JSON.stringify(text)
    },
  },

  'json-xml': {
    id: 'json-xml',
    name: 'JSON ⇄ XML',
    desc: 'JSON 与 XML 互转：数组转同名重复元素、XML 属性转 @attr，层级不丢失',
    action: '转 XML',
    lang: 'xml',
    placeholder: '转 XML：粘贴 JSON；转 JSON：粘贴 XML 文本',
    sample:
      '{"name":"智能马桶","price":2999,"tags":["卫浴","爆款"],"stock":{"warehouse":"北京仓","count":18}}',
    transform: (text) => jsonToXml(text),
    defaultMode: 'to-xml',
    modes: [
      {
        key: 'to-xml',
        label: '转 XML',
        lang: 'xml',
        sample:
          '{"name":"智能马桶","price":2999,"tags":["卫浴","爆款"],"stock":{"warehouse":"北京仓","count":18}}',
        transform: (text) => jsonToXml(text),
      },
      {
        key: 'to-json',
        label: '转 JSON',
        lang: 'json',
        sample:
          '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>智能马桶</name>\n  <price>2999</price>\n  <tag>卫浴</tag>\n  <tag>爆款</tag>\n  <stock>\n    <warehouse>北京仓</warehouse>\n    <count>18</count>\n  </stock>\n</root>',
        transform: (text) => xmlToJson(text),
      },
    ],
  },

  'encode-base64': {
    id: 'encode-base64',
    name: 'Base64 编解码',
    desc: 'UTF-8 文本与 Base64 互转，中文不乱码，兼容 URL-safe 变体',
    action: '编码',
    lang: 'text',
    placeholder: '编码：输入原始文本；解码：粘贴 Base64 字符串',
    sample: '你好，老板',
    transform: (text) => base64Encode(text),
    defaultMode: 'encode',
    modes: [
      {
        key: 'encode',
        label: '编码',
        sample: '你好，老板',
        transform: (text) => base64Encode(text),
      },
      {
        key: 'decode',
        label: '解码',
        sample: '5L2g5aW977yM6ICB5p2/',
        transform: (text) => base64Decode(text),
      },
    ],
  },

  'encode-url': {
    id: 'encode-url',
    name: 'URL 编解码',
    desc: '按 encodeURIComponent 规则做 URL 编解码，解码支持含中文的链接',
    action: '编码',
    lang: 'text',
    placeholder: '编码：输入文本或链接；解码：粘贴带 %XX 的 URL 参数',
    sample: 'https://example.com/search?q=JSON 格式化&lang=zh',
    transform: (text) => urlEncode(text),
    defaultMode: 'encode',
    modes: [
      {
        key: 'encode',
        label: '编码',
        sample: 'https://example.com/search?q=JSON 格式化&lang=zh',
        transform: (text) => urlEncode(text),
      },
      {
        key: 'decode',
        label: '解码',
        sample: '%E4%BD%A0%E5%A5%BD%EF%BC%8C%E8%80%81%E6%9D%BF',
        transform: (text) => urlDecode(text),
      },
    ],
  },
}

/** 默认落地页对应的工具 */
export const DEFAULT_TOOL_ID = 'json-format'
