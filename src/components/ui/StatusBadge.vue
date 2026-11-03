<script setup>
defineProps({
  /** ok | err | idle */
  state: { type: String, default: 'idle' },
  text: { type: String, required: true },
})
</script>

<template>
  <span class="badge" :class="`badge--${state}`">
    <i class="badge__dot" />
    {{ text }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
  color: var(--c-text-3);
  background: #f0f2f5;
}

.badge__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.badge--ok {
  color: var(--c-ok);
  background: var(--c-ok-soft);
}

.badge--err {
  color: var(--c-err);
  background: var(--c-err-soft);
}
</style>
