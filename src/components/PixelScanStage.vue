<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { PixelScanField, drawStaticWord } from '../lib/pixel-scan'

// Mounts the engine on a host div + canvas. The engine rasterises the word
// into a texture at construction, so we wait for fonts before creating it;
// otherwise the scan assembles a fallback-serif word. Reduced motion and
// missing WebGL both get the static rasterised word instead.
const props = defineProps<{
  word: string
}>()

const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let field: PixelScanField | null = null

onMounted(async () => {
  if (!host.value || !canvas.value) return
  await document.fonts.ready

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    drawStaticWord(canvas.value, host.value, props.word)
    return
  }

  try {
    const THREE = await import('three')
    field = new PixelScanField(host.value, canvas.value, THREE, {
      word: props.word,
    })
    field.start()
  } catch {
    drawStaticWord(canvas.value, host.value, props.word)
  }
})

onUnmounted(() => {
  field?.destroy()
  field = null
})
</script>

<template>
  <div ref="host" class="field" role="img" :aria-label="word">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.field {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}

.field canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
