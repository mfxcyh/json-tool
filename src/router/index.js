import { createRouter, createWebHashHistory } from 'vue-router'
import { TOOLS, DEFAULT_TOOL_ID } from '@/config/tools'
import ToolView from '@/views/ToolView.vue'

const routes = [
  {
    path: '/',
    redirect: `/${DEFAULT_TOOL_ID}`,
  },
  {
    path: '/:toolId',
    name: 'tool',
    component: ToolView,
    // 工具 id 不存在就直接进 404，避免页面渲染空壳
    beforeEnter: (to) => (TOOLS[to.params.toolId] ? true : { name: 'not-found' }),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

// 用 hash 模式：纯静态部署（含 file:// 直接打开）都不会出现刷新 404
export default createRouter({
  history: createWebHashHistory(),
  routes,
})
