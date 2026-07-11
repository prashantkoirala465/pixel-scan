// Tiny WebAudio cues for the scan field. Two sounds, both very quiet:
// glitchScan — a filtered-noise sweep that rides the entrance band,
// glitchTick — a short blip when the cursor crosses a glyph.
//
// The AudioContext is created lazily on first use; the first call happens
// inside a pointer event, so autoplay policy is satisfied. Every call is
// safe to make blind — no context, no sound, no error.

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function glitchScan(duration = 2.6): void {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime

  // looped white-noise burst through a rising bandpass — reads as the
  // band sweeping across the word.
  const len = Math.floor(ac.sampleRate * 0.4)
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

  const src = ac.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 6
  band.frequency.setValueAtTime(320, t0)
  band.frequency.exponentialRampToValueAtTime(3200, t0 + duration * 0.8)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.03, t0 + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  src.connect(band).connect(gain).connect(ac.destination)
  src.start(t0)
  src.stop(t0 + duration + 0.05)
}

let lastTick = 0

export function glitchTick(): void {
  // pointermove fires far faster than a tick should — rate-limit hard.
  const now = performance.now()
  if (now - lastTick < 70) return
  lastTick = now

  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime

  const osc = ac.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 1600 + Math.random() * 900

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.015, t0)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04)

  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + 0.05)
}
