import { createRouter, createWebHashHistory } from 'vue-router'
import { DEFAULT_TOOL_ID } from '@/config/tools'

/**
 * 每个工具一条显式路由 + 一个独立视图文件：
 * 想单独改某个页面的布局，直接改它自己的 view 即可，互不影响。
 * 未注册的路径统一落 404（catch-all）。
 */
const routes = [
  {
    path: '/',
    redirect: `/${DEFAULT_TOOL_ID}`,
  },
  {
    path: '/json-format',
    name: 'json-format',
    component: () => import('@/views/JsonFormatView.vue'),
    meta: { toolId: 'json-format' },
  },
  {
    path: '/json-minify',
    name: 'json-minify',
    component: () => import('@/views/JsonMinifyView.vue'),
    meta: { toolId: 'json-minify' },
  },
  {
    path: '/json-escape',
    name: 'json-escape',
    component: () => import('@/views/JsonEscapeView.vue'),
    meta: { toolId: 'json-escape' },
  },
  {
    path: '/encode-base64',
    name: 'encode-base64',
    component: () => import('@/views/EncodeBase64View.vue'),
    meta: { toolId: 'encode-base64' },
  },
  {
    path: '/encode-url',
    name: 'encode-url',
    component: () => import('@/views/EncodeUrlView.vue'),
    meta: { toolId: 'encode-url' },
  },
  {
    path: '/json-xml',
    name: 'json-xml',
    component: () => import('@/views/JsonXmlView.vue'),
    meta: { toolId: 'json-xml' },
  },
  {
    path: '/color-convert',
    name: 'color-convert',
    component: () => import('@/views/ColorView.vue'),
    meta: { toolId: 'color-convert' },
  },
  {
    path: '/image-base64',
    name: 'image-base64',
    component: () => import('@/views/ImageBase64View.vue'),
    meta: { toolId: 'image-base64' },
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
