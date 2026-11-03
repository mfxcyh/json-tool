import { reactive, watch } from 'vue'
import { NAV_GROUPS } from '@/config/navigation'

const STORAGE_KEY = 'devtoolbox:nav-open'

/** 默认全部展开 */
function createDefaultOpenMap() {
  return Object.fromEntries(NAV_GROUPS.map((group) => [group.id, true]))
}

function readOpenMap() {
  const fallback = createDefaultOpenMap()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

// 模块级单例：所有组件共享同一份折叠状态
const state = reactive({ openMap: readOpenMap() })

watch(
  () => state.openMap,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      /* 隐私模式下写不进去，忽略即可 */
    }
  },
  { deep: true },
)

/**
 * 导航折叠状态管理。
 * 选中态不放在这里 —— 它由路由（/:toolId）单一驱动，避免两套状态打架。
 * 若后续状态变复杂，可整体平移成 Pinia store，调用方无需改动。
 */
export function useNavigation() {
  const isOpen = (groupId) => state.openMap[groupId] !== false

  const toggle = (groupId) => {
    state.openMap[groupId] = !isOpen(groupId)
  }

  const expand = (groupId) => {
    if (!isOpen(groupId)) state.openMap[groupId] = true
  }

  return { openMap: state.openMap, isOpen, toggle, expand }
}
