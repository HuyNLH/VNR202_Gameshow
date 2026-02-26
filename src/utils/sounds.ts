/* =====================================================
   sounds.ts — Game sound effects using Web Audio API
   Không cần file audio ngoài — tất cả synthesize bằng code.
   ===================================================== */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/* ─── Helper: play a tone ────────────────────────── */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

/* ─── Helper: play noise burst ───────────────────── */
function playNoise(duration: number, volume = 0.1, delay = 0) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime + delay);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(ctx.currentTime + delay);
  source.stop(ctx.currentTime + delay + duration);
}

/* ═══════════════════════════════════════════════════
   Public Sound Effects
   ═══════════════════════════════════════════════════ */

/** Chọn vali — click nhẹ */
export function sfxSelectVali() {
  playTone(800, 0.08, 'sine', 0.15);
  playTone(1200, 0.06, 'sine', 0.1, 0.05);
}

/** P2 cướp vali — dramatic */
export function sfxSteal() {
  playTone(300, 0.15, 'sawtooth', 0.15);
  playTone(500, 0.15, 'sawtooth', 0.12, 0.08);
  playTone(700, 0.2, 'sawtooth', 0.1, 0.16);
}

/** P2 bỏ qua — nhẹ nhàng */
export function sfxPass() {
  playTone(600, 0.12, 'sine', 0.1);
  playTone(400, 0.15, 'sine', 0.08, 0.08);
}

/** Reveal vali — mở phong bì */
export function sfxReveal() {
  playNoise(0.08, 0.08);
  playTone(400, 0.08, 'triangle', 0.15, 0.02);
  playTone(600, 0.08, 'triangle', 0.15, 0.06);
  playTone(900, 0.12, 'triangle', 0.2, 0.10);
  playTone(1200, 0.2, 'sine', 0.12, 0.16);
}

/** Trả lời đúng — fanfare ngắn */
export function sfxCorrect() {
  playTone(523, 0.12, 'triangle', 0.2);       // C5
  playTone(659, 0.12, 'triangle', 0.2, 0.1);  // E5
  playTone(784, 0.12, 'triangle', 0.2, 0.2);  // G5
  playTone(1047, 0.35, 'triangle', 0.25, 0.3);// C6 (kéo dài)
}

/** Trả lời sai — buzzer */
export function sfxWrong() {
  playTone(200, 0.3, 'sawtooth', 0.12);
  playTone(180, 0.3, 'sawtooth', 0.1, 0.05);
}

/** Thử thách thành công */
export function sfxChallengeSuccess() {
  playTone(440, 0.1, 'triangle', 0.15);
  playTone(554, 0.1, 'triangle', 0.15, 0.08);
  playTone(659, 0.1, 'triangle', 0.15, 0.16);
  playTone(880, 0.3, 'triangle', 0.2, 0.24);
  playTone(880, 0.3, 'sine', 0.1, 0.24);
}

/** Thử thách thất bại */
export function sfxChallengeFail() {
  playTone(440, 0.15, 'square', 0.08);
  playTone(370, 0.15, 'square', 0.08, 0.12);
  playTone(311, 0.15, 'square', 0.08, 0.24);
  playTone(261, 0.4, 'square', 0.06, 0.36);
}

/** Bật ngôi sao ⭐ — magical */
export function sfxStarActivate() {
  playTone(880, 0.08, 'sine', 0.15);
  playTone(1100, 0.08, 'sine', 0.15, 0.06);
  playTone(1320, 0.08, 'sine', 0.15, 0.12);
  playTone(1760, 0.25, 'sine', 0.2, 0.18);
  // sparkle
  playTone(2200, 0.06, 'sine', 0.08, 0.25);
  playTone(2640, 0.06, 'sine', 0.06, 0.30);
}

/** Dùng lá chắn 🛡️ */
export function sfxShieldUse() {
  playTone(300, 0.06, 'triangle', 0.15);
  playTone(600, 0.15, 'triangle', 0.2, 0.04);
  playTone(500, 0.25, 'sine', 0.1, 0.12);
}

/** Nhận đặc quyền (perk) */
export function sfxPerkReceived() {
  playTone(660, 0.1, 'sine', 0.12);
  playTone(880, 0.1, 'sine', 0.12, 0.08);
  playTone(1100, 0.2, 'sine', 0.15, 0.16);
}

/** Vali phạt — ominous */
export function sfxPenalty() {
  playTone(150, 0.3, 'sawtooth', 0.1);
  playTone(120, 0.4, 'sawtooth', 0.08, 0.15);
}

/** Twist — dramatic reveal */
export function sfxTwist() {
  playTone(200, 0.1, 'square', 0.1);
  playTone(250, 0.1, 'square', 0.1, 0.1);
  playTone(300, 0.1, 'square', 0.1, 0.2);
  playTone(400, 0.1, 'square', 0.12, 0.3);
  playTone(600, 0.25, 'sawtooth', 0.15, 0.4);
}

/** Timer warning — beep khi còn ít giây */
export function sfxTimerTick() {
  playTone(1000, 0.06, 'sine', 0.1);
}

/** Hết giờ */
export function sfxTimeUp() {
  playTone(800, 0.15, 'square', 0.12);
  playTone(600, 0.15, 'square', 0.12, 0.15);
  playTone(400, 0.3, 'square', 0.1, 0.3);
}

/** Lượt mới */
export function sfxNextTurn() {
  playTone(500, 0.06, 'triangle', 0.1);
  playTone(700, 0.1, 'triangle', 0.12, 0.06);
}

/** Game kết thúc — victory fanfare */
export function sfxGameEnd() {
  playTone(523, 0.15, 'triangle', 0.2);
  playTone(659, 0.15, 'triangle', 0.2, 0.15);
  playTone(784, 0.15, 'triangle', 0.2, 0.3);
  playTone(1047, 0.15, 'triangle', 0.25, 0.45);
  playTone(784, 0.1, 'triangle', 0.15, 0.6);
  playTone(1047, 0.5, 'triangle', 0.3, 0.7);
}

/** Bắt đầu game */
export function sfxGameStart() {
  playTone(440, 0.1, 'triangle', 0.15);
  playTone(554, 0.1, 'triangle', 0.15, 0.1);
  playTone(659, 0.1, 'triangle', 0.15, 0.2);
  playTone(880, 0.35, 'triangle', 0.2, 0.3);
}

/** Hint reveal (R2) */
export function sfxHintReveal() {
  playTone(600, 0.06, 'sine', 0.1);
  playTone(900, 0.1, 'sine', 0.12, 0.04);
}

/** Submit answer (R2) */
export function sfxSubmitAnswer() {
  playTone(700, 0.08, 'triangle', 0.12);
  playTone(1000, 0.12, 'triangle', 0.15, 0.06);
}

/* ═══════════════════════════════════════════════════
   Background Music (BGM) — Procedural loop
   ═══════════════════════════════════════════════════ */

let bgmGainNode: GainNode | null = null;
let bgmLoopTimer: ReturnType<typeof setInterval> | null = null;
let bgmActive = false;
let bgmVol = 0.4;

/** Internal: play a note routed through the BGM gain bus */
function bgmNote(
  freq: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  delay: number,
) {
  if (!bgmGainNode) return;
  const ctx = getCtx();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g);
  g.connect(bgmGainNode);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Schedule one 16-beat loop (Cm – Eb – Ab – G progression) */
function scheduleBgmLoop() {
  if (!bgmActive || !bgmGainNode) return;
  const B = 60 / 126; // beat duration @ 126 BPM ≈ 0.476s

  // ── Bass (sine, root notes) ──
  const bass: [number, number][] = [
    [131, 0], [131, B * 2],       // C3 — Cm
    [156, B * 4], [156, B * 6],   // Eb3 — Eb
    [104, B * 8], [104, B * 10],  // Ab2 — Ab
    [98, B * 12], [117, B * 14],  // G2, Bb2 — G
  ];
  bass.forEach(([f, d]) => bgmNote(f, B * 1.4, 'sine', 0.45, d));

  // ── Chord pads (triangle, soft) ──
  const chords: [number[], number][] = [
    [[262, 311, 392], 0],         // Cm:  C4 Eb4 G4
    [[311, 392, 466], B * 4],     // Eb:  Eb4 G4 Bb4
    [[208, 262, 311], B * 8],     // Ab:  Ab3 C4 Eb4
    [[196, 247, 294], B * 12],    // G:   G3 B3 D4
  ];
  chords.forEach(([notes, d]) =>
    notes.forEach((f) => bgmNote(f, B * 3.4, 'triangle', 0.065, d)),
  );

  // ── Melody (sine, subtle game-show motif) ──
  // Measure 1 (Cm)
  bgmNote(523, B * 0.7, 'sine', 0.12, B * 0.5);    // C5
  bgmNote(622, B * 0.7, 'sine', 0.12, B * 1.5);    // Eb5
  bgmNote(523, B * 0.4, 'sine', 0.1, B * 2.5);     // C5
  bgmNote(392, B * 1, 'sine', 0.11, B * 3);         // G4
  // Measure 2 (Eb)
  bgmNote(466, B * 0.7, 'sine', 0.12, B * 5);       // Bb4
  bgmNote(392, B * 0.7, 'sine', 0.1, B * 6);        // G4
  bgmNote(311, B * 1.3, 'sine', 0.11, B * 7);       // Eb4
  // Measure 3 (Ab)
  bgmNote(523, B * 0.5, 'sine', 0.1, B * 9);        // C5
  bgmNote(466, B * 0.5, 'sine', 0.1, B * 10);       // Bb4
  bgmNote(392, B * 1, 'sine', 0.11, B * 11);        // G4
  // Measure 4 (G → resolve)
  bgmNote(494, B * 0.7, 'sine', 0.12, B * 13);      // B4
  bgmNote(587, B * 1, 'sine', 0.13, B * 14);        // D5
  bgmNote(523, B * 1, 'sine', 0.1, B * 15);         // C5

  // ── Rhythmic pulse (square, very quiet "tick") ──
  for (let i = 0; i < 16; i++) {
    bgmNote(80, 0.04, 'square', 0.03, B * i);
    if (i % 2 === 0) bgmNote(120, 0.02, 'square', 0.02, B * i + B * 0.5);
  }
}

/** Start background music loop */
export function bgmStart() {
  if (bgmActive) return;
  const ctx = getCtx();
  bgmGainNode = ctx.createGain();
  bgmGainNode.gain.setValueAtTime(bgmVol, ctx.currentTime);
  bgmGainNode.connect(ctx.destination);
  bgmActive = true;

  const B = 60 / 126;
  const loopMs = B * 16 * 1000; // ~7.6 s

  scheduleBgmLoop();
  bgmLoopTimer = setInterval(() => scheduleBgmLoop(), loopMs);
}

/** Stop background music with a short fade-out */
export function bgmStop() {
  bgmActive = false;
  if (bgmLoopTimer) {
    clearInterval(bgmLoopTimer);
    bgmLoopTimer = null;
  }
  if (bgmGainNode) {
    const ctx = getCtx();
    bgmGainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    const ref = bgmGainNode;
    setTimeout(() => { ref.disconnect(); }, 700);
    bgmGainNode = null;
  }
}

/** Toggle BGM on/off — returns new playing state */
export function bgmToggle(): boolean {
  if (bgmActive) { bgmStop(); return false; }
  bgmStart(); return true;
}

/** Check if BGM is currently playing */
export function bgmIsPlaying(): boolean {
  return bgmActive;
}

/** Set BGM volume (0–1) */
export function bgmSetVolume(v: number) {
  bgmVol = Math.max(0, Math.min(1, v));
  if (bgmGainNode) {
    bgmGainNode.gain.setValueAtTime(bgmVol, getCtx().currentTime);
  }
}
