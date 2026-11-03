<script setup>
import { DEFAULT_ROUTE_PATH } from '@/config/navigation'
</script>

<template>
  <div class="not-found">
    <div class="not-found__code">404</div>
    <div class="not-found__title">这个工具不存在</div>
    <p class="not-found__desc">地址里的工具标识没匹配上，可能是链接输错了。</p>
    <RouterLink class="not-found__link" :to="DEFAULT_ROUTE_PATH">回到 JSON 格式化</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px;
  text-align: center;
}

.not-found__code {
  font-family: var(--font-mono);
  font-size: 44px;
  font-weight: 700;
  color: #d6dae1;
  letter-spacing: -1px;
}

.not-found__title {
  font-size: var(--fs-title);
  font-weight: 650;
}

.not-found__desc {
  margin: 2px 0 12px;
  font-size: var(--fs-sm);
  color: var(--c-text-3);
}

.not-found__link {
  padding: 8px 16px;
  border-radius: 7px;
  background: var(--c-accent);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 600;
  text-decoration: none;
}

.not-found__link:hover {
  background: var(--c-accent-hover);
}
</style>
