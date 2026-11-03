<script setup>
defineProps({
  tool: { type: Object, required: true },
  groupName: { type: String, default: '' },
})
</script>

<template>
  <header class="tool-header">
    <div class="tool-header__crumb">
      工具箱 / <b>{{ groupName }}</b> / {{ tool.name }}
    </div>
    <h1 class="tool-header__title">{{ tool.name }}</h1>
    <p class="tool-header__desc">{{ tool.desc }}</p>
  </header>
</template>

<style scoped>
.tool-header {
  flex: 0 0 auto;
  padding: 14px 20px 12px;
}

.tool-header__crumb {
  margin-bottom: 4px;
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  letter-spacing: 0.2px;
}

.tool-header__crumb b {
  color: var(--c-text-2);
  font-weight: 600;
}

.tool-header__title {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: 0.2px;
}

.tool-header__desc {
  margin: 5px 0 0;
  font-size: var(--fs-sm);
  color: var(--c-text-3);
}

@media (max-width: 960px) {
  .tool-header {
    padding: 12px 14px 10px;
  }
}
</style>
