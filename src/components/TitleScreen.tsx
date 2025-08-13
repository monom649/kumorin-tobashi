// src/components/TitleScreen.tsx
import React, { useState } from 'react';
import { IMAGE_ASSETS } from '../../constants';
import { audioManager } from '../../utils/audio';
import { useGyroscope } from '../../hooks/useGyroscope';

interface TitleScreenProps { onStart: () => void; }

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const { requestPermission, error } = useGyroscope();
  const [msg, setMsg] = useState('');

  const handleStart = async () => {
    setMsg('');
    await audioManager.resumeContext();
    audioManager.stopAll();        // ★ タイトル音などが鳴っていても全停止
    audioManager.play('gamestart'); // 開始SEだけ鳴らす

    const ok = await requestPermission(); // iOS 13+ はタップ内で必須
    if (!ok) { setMsg('ジャイロセンサーの許可が必要です。'); return; }

    onStart();
  };

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.titleBg})` }}
    >
      <div className="relative flex-grow flex flex-col justify-center items-center w-full">
        <img
          src={IMAGE_ASSETS.kumorin}
          alt="くもりん"
          className="w-[46.3%] h-auto"
          style={{ maxWidth: 500 }}
        />
        <button
          onClick={handleStart}
          className="mt-8 px-12 py-4 bg-yellow-400 text-white text-3xl font-bold rounded-full shadow-lg border-4 border-yellow-500 transform hover:scale-105 transition-transform active:scale-95"
        >
          スタート
        </button>
        {(msg || error) && <div className="mt-4 text-white text-sm">{msg || error}</div>}
      </div>
      <div className="absolute bottom-4 text-center text-white text-xs w-full">
        <p>このゲームはジャイロセンサーを使用します。端末を縦向きでご利用ください。</p>
      </div>
    </div>
  );
};

export default TitleScreen;
