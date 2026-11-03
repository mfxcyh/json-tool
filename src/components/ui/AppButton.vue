<script setup>
defineProps({
  /** default | primary | ghost */
  variant: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
</script>

<template>
  <button
    type="button"
    class="app-btn"
    :class="`app-btn--${variant}`"
    :disabled="disabled"
    :title="title || undefined"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 33px;
  padding: 0 15px;
  border: 1px solid var(--c-border-strong);
  border-radius: 7px;
  background: #fff;
  color: var(--c-text-2);
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.app-btn:hover:not(:disabled) {
  border-color: #b9bfc9;
  color: var(--c-text);
  background: #fcfcfd;
}

.app-btn:active:not(:disabled) {
  transform: translateY(0.5px);
}

.app-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.app-btn--primary {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: #fff;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
}

.app-btn--primary:hover:not(:disabled) {
  background: var(--c-accent-hover);
  border-color: var(--c-accent-hover);
  color: #fff;
}

.app-btn--ghost {
  border-color: transparent;
  background: transparent;
  color: var(--c-text-3);
}

.app-btn--ghost:hover:not(:disabled) {
  background: #f1f2f5;
  color: var(--c-text-2);
  border-color: transparent;
}
</style>
