
import React from 'react';

interface ResultScreenProps {
  score: number;
  onRestart: () => void;
  onBackToTitle: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, onRestart, onBackToTitle }) => {
  const shareToTwitter = () => {
    const text = `『くもりんとばし』で${score}m飛びました！あなたはどこまで飛べる？ #くもりんとばし #サンサンキッズTV`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center p-8 text-white">
      
      <div className="text-center mb-12">
        <p className="text-9xl font-extrabold text-white tracking-wider" style={{ textShadow: '0 0 15px #fef08a' }}>
          {score}<span className="text-5xl ml-2 align-baseline">m</span>
        </p>
        <p className="text-4xl mt-4 font-bold">くもりんをとばした！</p>
      </div>

      <div className="flex flex-col space-y-6 w-full max-w-sm mt-8">
        <button
          onClick={shareToTwitter}
          className="w-full px-8 py-4 bg-blue-500 text-white text-2xl font-bold rounded-full shadow-lg border-2 border-blue-400 transform hover:scale-105 transition-transform active:scale-95"
        >
          Xでシェアする
        </button>
        <button
          onClick={onRestart}
          className="w-full px-8 py-4 bg-green-500 text-white text-2xl font-bold rounded-full shadow-lg border-2 border-green-400 transform hover:scale-105 transition-transform active:scale-95"
        >
          リトライ
        </button>
        <button
          onClick={onBackToTitle}
          className="w-full px-8 py-4 bg-gray-600 text-white text-2xl font-bold rounded-full shadow-lg border-2 border-gray-500 transform hover:scale-105 transition-transform active:scale-95"
        >
          タイトルに戻る
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
