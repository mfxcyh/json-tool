import { TOOLS, DEFAULT_TOOL_ID } from './tools'

/**
 * 二级导航结构。
 * items 只写工具 id，名称统一从 TOOLS 取，避免两处维护不同步。
 */
const RAW_GROUPS = [
  {
    id: 'json',
    name: 'JSON',
    items: ['json-format', 'json-minify', 'json-escape'],
  },
  {
    id: 'encode',
    name: '编码转换',
    items: ['encode-base64', 'encode-url'],
  },
  {
    id: 'convert',
    name: '格式转换',
    items: ['json-xml', 'image-base64'],
  },
  {
    id: 'color',
    name: '颜色',
    items: ['color-convert'],
  },
]

/** 渲染用结构：[{ id, name, items: [{ id, name }] }] */
export const NAV_GROUPS = RAW_GROUPS.map((group) => ({
  id: group.id,
  name: group.name,
  items: group.items
    .filter((id) => Boolean(TOOLS[id]))
    .map((id) => ({ id, name: TOOLS[id].name })),
}))

export const DEFAULT_GROUP_ID = RAW_GROUPS[0].id
export const DEFAULT_ROUTE_PATH = `/${DEFAULT_TOOL_ID}`

export function getTool(id) {
  return TOOLS[id] || null
}

/** 工具所属分组，用于面包屑与选中态 */
export function getGroupByToolId(toolId) {
  return RAW_GROUPS.find((group) => group.items.includes(toolId)) || null
}

export function getGroupName(toolId) {
  const group = getGroupByToolId(toolId)
  return group ? group.name : ''
}
