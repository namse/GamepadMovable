<template>
  <div ref="container" :class="{ selected: isSelected }">
    <slot></slot>
  </div>
</template>
<script lang="ts" src="./GamepadMovable.ts">
</script>
<style scoped>
  .selected {
    border: 1px solid red;
  }
</style>
