import { createRouter, createWebHashHistory } from 'vue-router'
import { TOOLS, DEFAULT_TOOL_ID } from '@/config/tools'
import ToolView from '@/views/ToolView.vue'

const routes = [
  {
    path: '/',
    redirect: `/${DEFAULT_TOOL_ID}`,
  },
  {
    // 颜色工具有专属视图（拾色器 + 表单），不走 ToolView 的文本框框架
    path: '/color-convert',
    name: 'color-convert',
    component: () => import('@/views/ColorView.vue'),
    meta: { toolId: 'color-convert' },
  },
  {
    // 图片 ⇄ Base64 也是文件型交互，走专属视图
    path: '/image-base64',
    name: 'image-base64',
    component: () => import('@/views/ImageBase64View.vue'),
    meta: { toolId: 'image-base64' },
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
