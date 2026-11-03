<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_GROUPS, getGroupByToolId } from '@/config/navigation'
import { useNavigation } from '@/composables/useNavigation'
import NavGroup from './NavGroup.vue'

const route = useRoute()
const { isOpen, toggle, expand } = useNavigation()

const groups = NAV_GROUPS
const activeId = computed(() => String(route.params.toolId || ''))

// 从其他入口带着参数跳进来时，确保所在分组是展开的
watch(
  activeId,
  (id) => {
    const group = getGroupByToolId(id)
    if (group) expand(group.id)
  },
  { immediate: true },
)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <div class="sidebar__mark">{ }</div>
      <div>
        <div class="sidebar__name">DevToolbox</div>
        <div class="sidebar__sub">开发者工具箱</div>
      </div>
    </div>

    <nav class="sidebar__nav">
      <NavGroup
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :open="isOpen(group.id)"
        :active-id="activeId"
        @toggle="toggle"
      />
    </nav>

    <div class="sidebar__foot">Vue 3 · v0.1.0</div>
  </aside>
</template>

<style scoped>
.sidebar {
  flex: 0 0 var(--sidebar-w);
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--c-panel);
  border-right: 1px solid var(--c-border);
}

.sidebar__brand {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 18px 16px;
}

.sidebar__mark {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: linear-gradient(140deg, #5b54f0, #4338ca);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.sidebar__name {
  font-size: var(--fs-base);
  font-weight: 650;
  letter-spacing: 0.2px;
}

.sidebar__sub {
  margin-top: 2px;
  font-size: var(--fs-xs);
  color: var(--c-text-3);
}

.sidebar__nav {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 10px 20px;
}

.sidebar__foot {
  flex: 0 0 auto;
  padding: 10px 18px 12px;
  border-top: 1px solid var(--c-border);
  font-size: var(--fs-xs);
  color: var(--c-text-3);
}

@media (max-width: 1180px) {
  .sidebar {
    flex-basis: var(--sidebar-w-md);
    width: var(--sidebar-w-md);
  }
}

@media (max-width: 960px) {
  .sidebar {
    width: 100%;
    flex: 0 0 auto;
    border-right: 0;
    border-bottom: 1px solid var(--c-border);
  }

  .sidebar__brand {
    padding: 12px 16px 10px;
  }

  .sidebar__nav {
    max-height: none;
    padding: 2px 10px 12px;
  }

  .sidebar__foot {
    display: none;
  }
}
</style>
