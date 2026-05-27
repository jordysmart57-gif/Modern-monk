export function practiceStatusClass(tone: "neutral" | "success" | "error") {
  if (tone === "error") {
    return "border border-ember/20 bg-ember/5 text-ember";
  }

  if (tone === "success") {
    return "border border-moss/15 bg-moss/10 text-moss";
  }

  return "border border-ink/10 bg-white/40 text-ink/60";
}

export function formatPracticeTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function formatCountUpTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

type BrowserWindowWithAudioFallback = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function playSoftChime() {
  const browserWindow = window as BrowserWindowWithAudioFallback;
  const AudioContextClass = browserWindow.AudioContext || browserWindow.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.4);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1.5);
}
