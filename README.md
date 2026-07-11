# pixel scan

A WebGL fragment shader over a word. A diagonal band sweeps across and
assembles the word out of a dense spray of tiny colored blocks; once the
sweep passes, the word rests as solid text — and the cursor lights a pool of
blocks with a wake that lingers behind it.

The engine is framework-free TypeScript over three.js; Vue 3 + Vite host it.

## Running it

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## How it works

**The word is a texture.** The engine
([`src/lib/pixel-scan.ts`](src/lib/pixel-scan.ts)) draws the word once to an
offscreen 2D canvas and uploads it as a texture. Everything on screen is one
fullscreen quad running the fragment shader; there is no per-block geometry.

**The blocks are a grid trick.** The shader quantises space into three
overlapping block grids at slightly different scales. Each cell samples the
word texture at its center and multiplies by the alpha, so blocks only ever
exist where glyphs are. Each cell also hashes its integer coordinates into a
per-cell jitter — that's what turns a clean diagonal edge into a dense,
sparkling spray.

**The sweep.** A normalized time value maps every cell onto a diagonal axis
(`dot(p, vec2(0.7071))`). A `smoothstep` band around the current time lights
the cells it's passing; behind the band, the plain texture multiplies in, so
the word is progressively left solid. Cell colors blend between two accents
with per-cell phase offsets, so the spray shimmers rather than blinking.

**The wake.** The cursor feeds a 24-slot ring buffer of trail points, passed
to the shader as uniform arrays. Points are laid down at fixed pixel spacing
along the cursor's path — not per pointer event — so a fast swipe leaves an
even trail instead of gaps. Each point's reach wobbles with two angular
sinusoids (a blobby, organic pool rather than a circle) and decays over about
a second with a smoothstep falloff. Near the live cursor, cells are also
pulled slightly toward it.

**Sound.** Two very quiet WebAudio cues ([`src/lib/sound.ts`](src/lib/sound.ts)):
a filtered-noise sweep on entrance and a rate-limited blip when the cursor
crosses a glyph (checked by reading the word canvas's alpha under the
pointer). The context is created lazily inside a pointer event, so autoplay
policy is satisfied; without audio support every call is a no-op.

**The Vue layer.**
[`PixelScanStage.vue`](src/components/PixelScanStage.vue) waits for
`document.fonts.ready` before constructing the engine — the texture is baked
once, and starting earlier would rasterise the fallback serif. three.js is
imported dynamically so it stays out of the initial chunk (~74kB vs ~700kB).

**Fallbacks.** `prefers-reduced-motion` and missing WebGL both render the
plain rasterised word to the same canvas, no animation. WebGL context
loss/restore is handled; DPR is capped at 2.

## Tuning

The engine takes options at construction:

```ts
new PixelScanField(host, canvas, THREE, {
  word: 'pixel scan',
  accent: [0.4, 0.75, 1.0],   // first spray color
  accent2: [1.0, 0.45, 0.8],  // second spray color (cells blend between)
  base: [0.85, 0.8, 1.0],     // resting block tint
  textColor: '#191b24',       // the settled word
})
```

The display face comes from the `--font-display` custom property on the host
element, so the word's typeface is a CSS decision.

## Project structure

```
src/
  App.vue                        stage framing and caption
  components/PixelScanStage.vue  mounting, font readiness, fallbacks
  lib/pixel-scan.ts              the engine: shader, trail, texture, events
  lib/sound.ts                   the two WebAudio cues
  style.css                      design tokens and page chrome
```

## License

[MIT](LICENSE)
