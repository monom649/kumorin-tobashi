// src/components/GameScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGyroscope } from '../../hooks/useGyroscope';
import { GameObject, GameObjectType } from '../../types';
import {
  GAME_WIDTH, GAME_HEIGHT, IMAGE_ASSETS, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_START_Y, PLAYER_MOVE_SPEED,
  GYRO_LEFT_MIN, GYRO_LEFT_MAX, GYRO_RIGHT_MIN, GYRO_RIGHT_MAX, PLAYER_BOUNDS_PADDING, OBJECT_SIZE,
  CLOUD_SPEED, CROW_SPEED, BIRD_SPEED, SPEED_MULTIPLIERS, BASE_SPEED_PPS, BANANA_SPAWN_INTERVAL,
  BANANA_SPAWN_CHANCE, OBSTACLE_SPAWN_INTERVAL, INITIAL_OBSTACLE_SPAWN_CHANCE,
  OBSTACLE_CHANCE_INCREASE_INTERVAL, OBSTACLE_CHANCE_INCREASE_AMOUNT, MAX_OBSTACLE_SPAWN_CHANCE
} from '../../constants';
import { audioManager } from '../../utils/audio';

interface GameScreenProps { onGameOver: (score: number) => void; }

const assetImages: { [key: string]: HTMLImageElement } = {};
Object.entries(IMAGE_ASSETS).forEach(([key, src]) => {
  const img = new Image();
  img.src = src;
  assetImages[key] = img;
});

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gyroData } = useGyroscope();

  // ジャイロ最新値は ref で読む（effect再生成を避ける）
  const gyroRef = useRef(gyroData);
  useEffect(() => { gyroRef.current = gyroData; }, [gyroData]);

  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [playerRenderX, setPlayerRenderX] = useState(playerX.current); // UIで必要なら保持
  const distance = useRef(0);
  const bananas = useRef(0);
  const speedMultiplier = useRef(1.0);
  const lastObstacleSpawnDist = useRef(0);
  const lastBananaSpawnDist = useRef(0);
  const obstacleSpawnChance = useRef(INITIAL_OBSTACLE_SPAWN_CHANCE);
  const gameObjects = useRef<GameObject[]>([]);
  const startTime = useRef(Date.now());
  const runningRef = useRef(false);

  const resetGameState = useCallback(() => {
    playerX.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    setPlayerRenderX(playerX.current);
    distance.current = 0;
    bananas.current = 0;
    speedMultiplier.current = 1.0;
    lastObstacleSpawnDist.current = 0;
    lastBananaSpawnDist.current = 0;
    obstacleSpawnChance.current = INITIAL_OBSTACLE_SPAWN_CHANCE;
    gameObjects.current = [];
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    resetGameState();

    // BGMは排他再生で一度だけ（多重→ビープを防止）
    audioManager.playExclusive('bgm', true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    runningRef.current = true;
    let animationFrameId = 0;
    let nextObjectId = 0;

    const gameLoop = () => {
      if (!runningRef.current) return;

      // 距離（m）：30秒で100m（BASE_SPEED_PPS）
      const elapsedSeconds = (Date.now() - startTime.current) / 1000;
      distance.current = elapsedSeconds * BASE_SPEED_PPS * speedMultiplier.current;

      // ── ジャイロ：γ(左右の傾き) を優先、無いとき α にフォールバック ──
      const g = gyroRef.current;
      const gamma = g.gamma; // 左右の傾き（-90〜+90）
      const alpha = g.alpha; // 方位（0〜360：来ない端末あり）

      if (gamma !== null && !Number.isNaN(gamma)) {
        if (gamma <= -10) {
          // 右に傾けると画面上は右移動になるケースが多い（端末依存あり）
          playerX.current = Math.max(PLAYER_BOUNDS_PADDING, playerX.current - PLAYER_MOVE_SPEED);
        } else if (gamma >= 10) {
          playerX.current = Math.min(GAME_WIDTH - PLAYER_WIDTH - PLAYER_BOUNDS_PADDING, playerX.current + PLAYER_MOVE_SPEED);
        }
      } else if (alpha !== null) {
        // 互換：従来のαレンジ（仕様上のしきい値）
        if (alpha > GYRO_LEFT_MIN && alpha < GYRO_LEFT_MAX) {
          playerX.current = Math.max(PLAYER_BOUNDS_PADDING, playerX.current - PLAYER_MOVE_SPEED);
        } else if (alpha > GYRO_RIGHT_MIN && alpha < GYRO_RIGHT_MAX) {
          playerX.current = Math.min(GAME_WIDTH - PLAYER_WIDTH - PLAYER_BOUNDS_PADDING, playerX.current + PLAYER_MOVE_SPEED);
        }
      }
      setPlayerRenderX(playerX.current);

      // ── 生成：雲 ──
      if (Math.random() < 0.02 && gameObjects.current.filter(o => o.type === GameObjectType.Cloud).length < 5) {
        gameObjects.current.push({
          id: nextObjectId++,
          type: GameObjectType.Cloud,
          x: Math.random() * GAME_WIDTH,
          y: -OBJECT_SIZE,
          width: OBJECT_SIZE * (Math.random() * 1.5 + 1),
          height: OBJECT_SIZE * (Math.random() * 1.5 + 1),
          vx: 0,
          vy: CLOUD_SPEED * (Math.random() * 0.5 + 0.75),
          img: Math.random() > 0.5 ? assetImages.cloudA : assetImages.cloudB
        });
      }

      // ── 生成：障害物（50mごと）＆確率上昇（200mごと +5% 上限60%）──
      if (distance.current - lastObstacleSpawnDist.current > OBSTACLE_SPAWN_INTERVAL) {
        lastObstacleSpawnDist.current = distance.current;
        if (Math.random() < obstacleSpawnChance.current) {
          if (Math.random() > 0.5) {
            gameObjects.current.push({
              id: nextObjectId++,
              type: GameObjectType.Crow,
              x: Math.random() * (GAME_WIDTH - OBJECT_SIZE),
              y: -OBJECT_SIZE,
              width: OBJECT_SIZE,
              height: OBJECT_SIZE,
              vx: 0,
              vy: CROW_SPEED,
              img: assetImages.crow
            });
          } else {
            const fromLeft = Math.random() > 0.5;
            const yPos = Math.random() * (GAME_HEIGHT * 0.6);
            const vx = fromLeft ? BIRD_SPEED : -BIRD_SPEED;
            const startX = fromLeft ? -OBJECT_SIZE : GAME_WIDTH;
            const birdImg = fromLeft ? assetImages.birdLeft : assetImages.birdRight;
            for (let i = 0; i < 3; i++) {
              const dx = fromLeft ? -(i * (OBJECT_SIZE + 20)) : (i * (OBJECT_SIZE + 20));
              gameObjects.current.push({
                id: nextObjectId++,
                type: GameObjectType.MigratoryBird,
                x: startX + dx,
                y: yPos,
                width: OBJECT_SIZE,
                height: OBJECT_SIZE,
                vx,
                vy: 0,
                img: birdImg
              });
            }
          }
        }
        const prevBucket = Math.floor((distance.current - OBSTACLE_SPAWN_INTERVAL) / OBSTACLE_CHANCE_INCREASE_INTERVAL);
        const currBucket = Math.floor(distance.current / OBSTACLE_CHANCE_INCREASE_INTERVAL);
        if (currBucket > prevBucket) {
          obstacleSpawnChance.current = Math.min(
            MAX_OBSTACLE_SPAWN_CHANCE,
            obstacleSpawnChance.current + OBSTACLE_CHANCE_INCREASE_AMOUNT
          );
        }
      }

      // ── 生成：バナナ（100mごと 40%）──
      if (distance.current - lastBananaSpawnDist.current > BANANA_SPAWN_INTERVAL) {
        lastBananaSpawnDist.current = distance.current;
        if (Math.random() < BANANA_SPAWN_CHANCE && bananas.current < 5) {
          gameObjects.current.push({
            id: nextObjectId++,
            type: GameObjectType.Banana,
            x: Math.random() * (GAME_WIDTH - OBJECT_SIZE),
            y: -OBJECT_SIZE,
            width: OBJECT_SIZE,
            height: OBJECT_SIZE,
            vx: 0,
            vy: CROW_SPEED,
            img: assetImages.banana
          });
        }
      }

      // ── 移動＆衝突判定 ──
      gameObjects.current = gameObjects.current.filter(obj => {
        obj.y += obj.vy * speedMultiplier.current;
        obj.x += obj.vx * speedMultiplier.current;

        const playerRect = { x: playerX.current, y: PLAYER_START_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
        const objRect = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };

        const hit =
          playerRect.x < objRect.x + objRect.width &&
          playerRect.x + playerRect.width > objRect.x &&
          playerRect.y < objRect.y + objRect.height &&
          playerRect.y + playerRect.height > objRect.y;

        if (hit) {
          if (obj.type === GameObjectType.Banana) {
            if (bananas.current < 5) {
              bananas.current++;
              speedMultiplier.current = SPEED_MULTIPLIERS[bananas.current];
            }
            audioManager.play('item');
            return false;
          } else if (obj.type === GameObjectType.Crow || obj.type === GameObjectType.MigratoryBird) {
            audioManager.stop('bgm');
            audioManager.play('out');
            audioManager.play('gameover');
            onGameOver(Math.floor(distance.current));
            runningRef.current = false;
            cancelAnimationFrame(animationFrameId);
            return false;
          }
        }
        return obj.y < GAME_HEIGHT && obj.x > -obj.width * 4 && obj.x < GAME_WIDTH + obj.width * 4;
      });

      // ── 描画 ──
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // 背景
      if (assetImages.gameBg.complete) ctx.drawImage(assetImages.gameBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      else {
        ctx.fillStyle = '#7ecbff';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      // 生成物
      gameObjects.current.forEach(obj => {
        if (obj.img && obj.img.complete) {
          ctx.save();
          ctx.globalAlpha = obj.type === GameObjectType.Cloud ? 0.7 : 1.0;
          ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
          ctx.restore();
        } else {
          // 画像未ロード時の代替描画（動作確認用）
          ctx.fillStyle = obj.type === GameObjectType.Banana ? '#ffd54f'
                        : obj.type === GameObjectType.Cloud ? 'rgba(255,255,255,0.7)'
                        : '#333';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
      });

      // プレイヤー（★canvasに直接描画：CSSスケールずれ対策）
      if (assetImages.kumorin.complete) {
        ctx.drawImage(assetImages.kumorin, playerX.current, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
      } else {
        ctx.fillStyle = '#ff8';
        ctx.fillRect(playerX.current, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
      }

      // UI（距離・バナナ）
      ctx.font = 'bold 72px sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 8;
      const distText = `${Math.floor(distance.current)}m`;
      ctx.strokeText(distText, GAME_WIDTH / 2, 100);
      ctx.fillText(distText, GAME_WIDTH / 2, 100);

      // 右上のバナナ
      if (assetImages.banana.complete) {
        for (let i = 0; i < 5; i++) {
          ctx.globalAlpha = i < bananas.current ? 1.0 : 0.3;
          ctx.drawImage(assetImages.banana, GAME_WIDTH - (i + 1) * 80 - 20, 40, 70, 70);
        }
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(animationFrameId);
      audioManager.stop('bgm');
    };
  }, [onGameOver, resetGameState]); // ★ ループは1本：gyroDataは依存に入れない

  return (
    <div className="w-full h-full relative bg-blue-300">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="w-full h-full object-contain" />
      {/* プレイヤーはcanvasに描画するため <img> は削除 */}
    </div>
  );
};

export default GameScreen;
