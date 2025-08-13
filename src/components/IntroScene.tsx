
import React, { useState, useEffect } from 'react';
import { IMAGE_ASSETS } from '../constants';
import { audioManager } from '../utils/audio';

interface IntroSceneProps {
  onIntroEnd: () => void;
}

const IntroScene: React.FC<IntroSceneProps> = ({ onIntroEnd }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Step 0: Initial state
    // Step 1: Soda Ojisan enters
    const timer1 = setTimeout(() => {
      setAnimationStep(1);
      audioManager.play('soda');
    }, 100);

    // Step 2: Kumorin flies out (0.5s earlier)
    const timer2 = setTimeout(() => {
      setAnimationStep(2);
      audioManager.play('ohno');
    }, 600); // Was 1100ms

    // Step 3: Transition to game
    const timer3 = setTimeout(() => {
      audioManager.play('gamestart');
      onIntroEnd();
    }, 1600); // Was 2100ms, adjusted to keep 1s fly-out duration

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onIntroEnd]);

  return (
    <div 
      className="w-full h-full bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.gameBg})` }}
    >
      <div
        className={`absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[46.3%] max-w-[500px] transition-transform duration-1000 ${
          animationStep >= 2 ? 'translate-y-[-100vh]' : 'translate-y-0'
        }`}
        style={{ transitionTimingFunction: 'ease-out' }}
      >
        <img src={IMAGE_ASSETS.kumorin} alt="くもりん" />
      </div>

      <div
        className={`absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[55.6%] max-w-[600px] transition-transform duration-1000 ${
          animationStep >= 1 ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <img src={IMAGE_ASSETS.soda} alt="ソーダおじさん" />
      </div>
    </div>
  );
};

export default IntroScene;
