export function playTone(kind: "success" | "error" | "warning") {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const notes =
    kind === "success" ? [660, 880] : kind === "error" ? [320, 220] : [520, 400];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "success" ? "sine" : "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.14 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.14 + 0.16);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.14);
    osc.stop(ctx.currentTime + i * 0.14 + 0.18);
  });
  setTimeout(() => ctx.close(), 800);
}
