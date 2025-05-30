import { useState, useEffect } from 'react';
import { Howl } from 'howler';

// サウンドの種類を定義
type SoundType = 'flip' | 'correct' | 'again' | 'win';

// サウンドファイルのパスを定義
const soundFiles: Record<SoundType, string> = {
  flip: '/blood-lab-flashcards/sounds/flip.mp3',
  correct: '/blood-lab-flashcards/sounds/correct.mp3',
  again: '/blood-lab-flashcards/sounds/again.mp3',
  win: '/blood-lab-flashcards/sounds/win.mp3',
};

// サウンドインスタンスを作成
const sounds: Record<SoundType, Howl> = {
  flip: new Howl({ src: [soundFiles.flip], preload: true }),
  correct: new Howl({ src: [soundFiles.correct], preload: true }),
  again: new Howl({ src: [soundFiles.again], preload: true }),
  win: new Howl({ src: [soundFiles.win], preload: true }),
};

// ローカルストレージのキー
const SOUND_STORAGE_KEY = 'bl_sound';

export const useSound = () => {
  // サウンドの有効/無効状態を管理
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    // ローカルストレージから設定を読み込む
    const savedSetting = localStorage.getItem(SOUND_STORAGE_KEY);
    // 初期値は true（有効）
    return savedSetting === null ? true : savedSetting === 'true';
  });

  // サウンドの再生関数
  const play = (soundType: SoundType) => {
    if (soundEnabled) {
      sounds[soundType].play();
    }
  };

  // サウンドの有効/無効を切り替える関数
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // soundEnabled の状態が変わったらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    play
  };
};
