import React, { useState } from 'react';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';

type Screen = 'title' | 'game' | 'result';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('title');
  const [lastScore, setLastScore] = useState<number>(0);

  const handleStart = () => setScreen('game');

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setScreen('result');
  };

  if (screen === 'title') {
    return <TitleScreen onStart={handleStart} />;
  }

  if (screen === 'game') {
    return <GameScreen onGameOver={handleGameOver} />;
  }

  // result
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-300">
      <div className="text-white text-5xl font-bold mb-6">{lastScore}m</div>
      <div className="flex gap-4">
        <button
          className="px-8 py-3 bg-yellow-400 text-white text-2xl font-bold rounded-full shadow-lg border-4 border-yellow-500 active:scale-95"
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
