import React, { useEffect } from 'react';
import { IMAGE_ASSETS } from '../../constants';
import { audioManager } from '../../utils/audio';

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    audioManager.play('title', true); // 未設定なら無音スルー
    return () => audioManager.stop('title');
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col"
         style={{ backgroundImage: `url(${IMAGE_ASSETS.titleBg})`, backgroundSize: 'cover' }}>
      <div className="flex items-center justify-between p-4">
        <img src={IMAGE_ASSETS.soda} alt="ソーダ" className="w-16 h-16 object-contain" />
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow">くもりんとばし</h1>
        <div className="w-16" />
      </div>

      <div className="relative flex-grow flex flex-col justify-center items-center w-full">
        <img src={IMAGE_ASSETS.kumorin} alt="くもりん"
             className="w-[46.3%] h-auto" style={{ maxWidth: '500px' }} />
        <button
          onClick={onStart}
          className="mt-8 px-12 py-4 bg-yellow-400 text-white text-2xl font-bold rounded-full shadow-lg border-4 border-white active:scale-95 transform hover:scale-105 transition-transform"
        >
          スタート
        </button>
      </div>

      <div className="absolute bottom-4 text-center text-white w-full">
        <p>スマホを傾けて左右に動かそう！</p>
      </div>
    </div>
  );
};

export default TitleScreen;
