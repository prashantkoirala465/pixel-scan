<script setup lang="ts">
import PixelScanStage from './components/PixelScanStage.vue'

const word = 'pixel scan'
</script>

<template>
  <main class="stage">
    <div class="frame">
      <PixelScanStage :word="word" />
    </div>
    <p class="caption">move across the word — the wake lingers</p>
  </main>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  width: 100%;
}

.frame {
  width: min(1100px, 94vw);
  height: clamp(280px, 42vw, 480px);
}

.caption {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--quiet);
}
</style>
