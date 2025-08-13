// utils/audio.ts
type AudioMap = { [key: string]: HTMLAudioElement };

class AudioManager {
  private contextUnlocked = false;
  private audios: AudioMap = {};
  private playing: Set<string> = new Set();

  register(key: string, src: string, loop = false) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = 'auto';
    this.audios[key] = audio;
  }

  async resumeContext(): Promise<void> {
    if (this.contextUnlocked) return;
    try {
      const a = new Audio();
      a.muted = true;
      a.src = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA'; // 無音
      await a.play().catch(() => {});
      this.contextUnlocked = true;
    } catch {}
  }

  isPlaying(key: string) {
    return this.playing.has(key);
  }

  play(key: string, loop = false) {
    const a = this.audios[key];
    if (!a) return;
    a.loop = loop;

    // ループBGMは多重再生しない
    if (loop && this.playing.has(key)) return;

    try { a.currentTime = 0; } catch {}
    a.play().then(() => {
      this.playing.add(key);
      a.onended = () => {
        this.playing.delete(key);
      };
    }).catch(() => {});
  }

  /** 他の音を全停止してから key を再生（BGM切替などに） */
  playExclusive(key: string, loop = false) {
    this.stopAll();
    this.play(key, loop);
  }

  stop(key: string) {
    const a = this.audios[key];
    if (!a) return;
    a.pause();
    try { a.currentTime = 0; } catch {}
    this.playing.delete(key);
  }

  stopAll() {
    Object.keys(this.audios).forEach(k => this.stop(k));
    this.playing.clear();
  }
}

export const audioManager = new AudioManager();

audioManager.register('title', 'title.wav', true);
audioManager.register('soda', 'soda.wav');
audioManager.register('ohno', 'ohno.wav');
audioManager.register('gamestart', 'gamestart.wav');
audioManager.register('item', 'item.wav');
audioManager.register('out', 'out.wav');
audioManager.register('gameover', 'gameover.wav');
audioManager.register('bgm', 'BGM_HURRY.mp3', true);
