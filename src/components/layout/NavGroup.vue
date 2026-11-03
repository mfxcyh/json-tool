<script setup>
defineProps({
  group: { type: Object, required: true },
  open: { type: Boolean, default: true },
  activeId: { type: String, default: '' },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div class="nav-group">
    <button
      type="button"
      class="nav-group__head"
      :aria-expanded="open"
      @click="emit('toggle', group.id)"
    >
      <svg
        class="nav-group__chevron"
        :class="{ 'nav-group__chevron--open': open }"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span>{{ group.name }}</span>
      <span class="nav-group__count">{{ group.items.length }}</span>
    </button>

    <div v-show="open" class="nav-group__items">
      <RouterLink
        v-for="item in group.items"
        :key="item.id"
        class="nav-item"
        :class="{ 'nav-item--active': item.id === activeId }"
        :to="`/${item.id}`"
      >
        {{ item.name }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.nav-group {
  margin-bottom: 2px;
}

.nav-group__head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 8px;
  border-radius: 7px;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--c-text-2);
  letter-spacing: 0.3px;
  transition: background 0.15s, color 0.15s;
}

.nav-group__head:hover {
  background: #f3f4f7;
  color: var(--c-text);
}

.nav-group__chevron {
  flex: 0 0 auto;
  color: var(--c-text-3);
  transition: transform 0.18s ease;
}

.nav-group__chevron--open {
  transform: rotate(90deg);
}

.nav-group__count {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 20px;
  background: #f0f2f5;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.nav-group__items {
  padding: 2px 0 6px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 10px 8px 30px;
  border-radius: 7px;
  font-size: var(--fs-nav);
  color: var(--c-text-2);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: var(--c-hover);
  color: var(--c-text);
}

.nav-item--active {
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-weight: 600;
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-accent);
  transform: translateY(-50%);
}
</style>
