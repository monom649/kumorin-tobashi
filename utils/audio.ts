// 軽量オーディオ管理。
// 下の AUDIO_SOURCES に実ファイルURLを設定すれば鳴ります。設定が無いキーは play() しても無音で安全にスルーします。
const AUDIO_SOURCES: Record<string, string> = {
  // 例:
  // title: '/sounds/title_bgm.mp3',
  // bgm: '/sounds/game_bgm.mp3',
  // banana: '/sounds/get_item.wav',
  // hit: '/sounds/hit.wav',
};

type Playing = { el: HTMLAudioElement; loop: boolean; };

class AudioManager {
  private playing: Map<string, Playing> = new Map();
  private unlocked = false;

  private ensureUnlocked() {
    if (this.unlocked) return;
    const tryUnlock = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch {}
      this.unlocked = true;
      window.removeEventListener('pointerdown', tryUnlock);
      window.removeEventListener('touchstart', tryUnlock);
      window.removeEventListener('click', tryUnlock);
    };
    window.addEventListener('pointerdown', tryUnlock, { once: true });
    window.addEventListener('touchstart', tryUnlock, { once: true });
    window.addEventListener('click', tryUnlock, { once: true });
  }

  play(name: string, loop = false) {
    this.ensureUnlocked();
    const src = AUDIO_SOURCES[name];
    if (!src) return; // 未設定なら無音

    this.stop(name);
    const el = new Audio(src);
    el.loop = loop;
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.play().catch(() => {});
    this.playing.set(name, { el, loop });
  }

  stop(name: string) {
    const p = this.playing.get(name);
    if (!p) return;
    try { p.el.pause(); p.el.currentTime = 0; } catch {}
    this.playing.delete(name);
  }
}

export const audioManager = new AudioManager();
