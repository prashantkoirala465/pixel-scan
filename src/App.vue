<script setup lang="ts">
const word = 'pixel scan'
</script>

<template>
  <main class="stage">
    <h1>{{ word }}</h1>
  </main>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 24px;
}
</style>
