import React, { useState } from 'react';
import TitleScreen from './src/components/TitleScreen';
import GameScreen from './src/components/GameScreen';

type Screen = 'title' | 'game' | 'result';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('title');
  const [lastScore, setLastScore] = useState<number>(0);

  const handleStart = () => setScreen('game');
  const handleGameOver = (score: number) => {
    setLastScore(score);
    setScreen('result');
  };

  if (screen === 'title') return <TitleScreen onStart={handleStart} />;
  if (screen === 'game') return <GameScreen onGameOver={handleGameOver} />;

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-blue-400 text-white">
      <h1 className="text-4xl mb-4">結果</h1>
      <p className="text-2xl mb-6">飛んだ距離: {Math.floor(lastScore)} m</p>
      <div className="flex gap-4">
        <button
          className="px-8 py-3 bg-white text-blue-500 text-2xl font-bold rounded-full shadow-lg border-4 border-white active:scale-95"
          onClick={() => setScreen('game')}
        >
          もう一度
        </button>
        <button
          className="px-8 py-3 bg-white text-blue-500 text-2xl font-bold rounded-full shadow-lg border-4 border-white active:scale-95"
          onClick={() => setScreen('title')}
        >
          タイトルへ
        </button>
      </div>
    </div>
  );
};

export default App;
