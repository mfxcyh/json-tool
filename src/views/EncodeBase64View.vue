<script setup>
// Base64 编解码 —— 页面级薄壳：路由独立、文件独立，公共逻辑在 ToolPage
import ToolPage from '@/components/tool/ToolPage.vue'
</script>

<template>
  <ToolPage tool-id="encode-base64" />
</template>
