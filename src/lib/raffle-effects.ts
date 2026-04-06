// ─── ÁUDIO DO SORTEIO ────────────────────────────────────────────────────────
let raffleAudio: HTMLAudioElement | null = null;

export function playRaffleMusic() {
  try {
    if (raffleAudio) { raffleAudio.pause(); raffleAudio = null; }
    const audio = new Audio("/assets/songs/ruffle.mp3");
    audio.volume = 0.7;
    // Reinicia manualmente ao terminar — evita gap do loop nativo em alguns browsers
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      void audio.play();
    });
    raffleAudio = audio;
    void audio.play();
  } catch { /* silencia */ }
}

export function stopRaffleMusic() {
  if (!raffleAudio) return;
  const audio = raffleAudio;
  raffleAudio = null;
  const startVol = audio.volume;
  const steps = 20;
  let step = 0;
  const fade = setInterval(() => {
    step++;
    audio.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(fade);
    }
  }, 40);
}
export function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = [
    "#f97316","#facc15","#22c55e","#3b82f6","#a855f7",
    "#ec4899","#ffffff","#ef4444","#06b6d4","#84cc16",
  ];

  // Dispara 3 ondas de confetes
  const allParticles: Particle[] = [];
  for (let wave = 0; wave < 3; wave++) {
    const delay = wave * 400;
    const count = wave === 0 ? 200 : 120;
    for (let i = 0; i < count; i++) {
      allParticles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 60,
        r: 5 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 10,
        vy: 2 + Math.random() * 6,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "star",
        born: delay,
        alpha: 1,
      });
    }
  }

  let frame: number;
  let elapsed = 0;
  let last = performance.now();

  const draw = (now: number) => {
    const dt = now - last;
    last = now;
    elapsed += dt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of allParticles) {
      if (elapsed < p.born) { alive = true; continue; }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.vx *= 0.99;
      p.rot += p.rotV;
      p.alpha = Math.max(0, 1 - (p.y / (canvas.height * 1.1)));
      if (p.y < canvas.height + 30) alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;

      if (p.shape === "rect") {
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // estrela
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
          const b = (j * 4 * Math.PI) / 5 + (2 * Math.PI) / 5 - Math.PI / 2;
          if (j === 0) ctx.moveTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
          else ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
          ctx.lineTo(Math.cos(b) * p.r * 0.4, Math.sin(b) * p.r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive) frame = requestAnimationFrame(draw);
    else canvas.remove();
  };

  frame = requestAnimationFrame(draw);
  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 8000);
}

interface Particle {
  x: number; y: number; r: number; color: string;
  vx: number; vy: number; rot: number; rotV: number;
  shape: string; born: number; alpha: number;
}

// ─── SOM IMPONENTE ────────────────────────────────────────────────────────────
export function playWinSound() {
  try {
    const ctx = new AudioContext();

    // Fanfarra orquestral: acorde + melodia ascendente + bombo
    const playNote = (freq: number, t: number, dur: number, vol: number, type: OscillatorType = "sawtooth") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3000;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.02);
      gain.gain.setValueAtTime(vol, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    const playDrum = (t: number) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
    };

    const now = ctx.currentTime;

    // Acorde inicial (C major chord)
    [261, 329, 392, 523].forEach(f => playNote(f, now, 0.8, 0.12, "sawtooth"));

    // Melodia ascendente triunfal
    const melody = [523, 587, 659, 698, 784, 880, 988, 1047];
    melody.forEach((f, i) => {
      playNote(f, now + 0.1 + i * 0.1, 0.25, 0.18, "square");
    });

    // Acorde final sustentado
    [523, 659, 784, 1047, 1319].forEach(f => playNote(f, now + 1.0, 1.5, 0.1, "sawtooth"));

    // Bombos
    playDrum(now);
    playDrum(now + 0.5);
    playDrum(now + 1.0);
    playDrum(now + 1.25);

  } catch { /* silencia se AudioContext não disponível */ }
}

// ─── HISTÓRICO LOCAL ─────────────────────────────────────────────────────────
const HISTORY_KEY_PREFIX = "raffle_history_";

export interface RaffleHistoryEntry {
  winner: string;
  date: string;
  editionId: string;
}

export function saveToHistory(type: "clientes" | "vendedores", entry: RaffleHistoryEntry) {
  if (typeof window === "undefined") return;
  const key = HISTORY_KEY_PREFIX + type;
  const existing: RaffleHistoryEntry[] = JSON.parse(localStorage.getItem(key) || "[]");
  existing.unshift(entry);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 5)));
}

export function clearHistory(type: "clientes" | "vendedores") {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY_PREFIX + type);
}

export function getHistory(type: "clientes" | "vendedores"): RaffleHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const key = HISTORY_KEY_PREFIX + type;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
