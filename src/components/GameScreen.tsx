import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  GAME_WIDTH, GAME_HEIGHT, IMAGE_ASSETS, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_START_Y, PLAYER_MOVE_SPEED,
  GYRO_LEFT_MIN, GYRO_LEFT_MAX, GYRO_RIGHT_MIN, GYRO_RIGHT_MAX, PLAYER_BOUNDS_PADDING, OBJECT_SIZE,
  CLOUD_SPEED, CROW_SPEED, BIRD_SPEED, SPEED_MULTIPLIERS, BASE_SPEED_PPS, BANANA_SPAWN_INTERVAL,
  BANANA_SPAWN_CHANCE, OBSTACLE_SPAWN_INTERVAL, INITIAL_OBSTACLE_SPAWN_CHANCE,
  OBSTACLE_CHANCE_INCREASE_INTERVAL, OBSTACLE_CHANCE_INCREASE_AMOUNT, MAX_OBSTACLE_SPAWN_CHANCE
} from '../../constants';
import { useGyroscope } from '../../hooks/useGyroscope';
import { audioManager } from '../../utils/audio';

type GameObjectType = 'banana' | 'cloudA' | 'cloudB' | 'crow' | 'birdLeft' | 'birdRight';
type GameObject = { id:number; type:GameObjectType; x:number; y:number; w:number; h:number; vy:number; };

const assetImages: { [key:string]: HTMLImageElement } = {};
Object.entries(IMAGE_ASSETS).forEach(([k, src]) => { const img = new Image(); img.src = src as string; assetImages[k] = img; });

const clamp = (v:number, min:number, max:number) => Math.max(min, Math.min(max, v));

interface GameScreenProps { onGameOver: (score:number) => void; }

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gyroData } = useGyroscope();

  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const speedIndex = useRef(0);
  const distanceM = useRef(0);
  const lastTime = useRef<number | null>(null);
  const objects = useRef<GameObject[]>([]);
  const [hudDistance, setHudDistance] = useState(0);

  const spawnCounter = useRef({ banana: 0, obstacle: 0 });
  const nextId = useRef(1);
  const running = useRef(true);

  const reset = useCallback(() => {
    playerX.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    speedIndex.current = 0;
    distanceM.current = 0;
    lastTime.current = null;
    objects.current = [];
    spawnCounter.current = { banana: 0, obstacle: 0 };
    nextId.current = 1;
    running.current = true;
  }, []);

  useEffect(() => {
    reset();
    audioManager.play('bgm', true);
    return () => audioManager.stop('bgm');
  }, [reset]);

  const update = useCallback((dtMs:number) => {
    const dt = dtMs / 1000;
    const metersThisFrame = (BASE_SPEED_PPS * SPEED_MULTIPLIERS[speedIndex.current]) * dt / 60;
    distanceM.current += metersThisFrame;

    if (distanceM.current > 400 && speedIndex.current < SPEED_MULTIPLIERS.length - 1) {
      speedIndex.current++;
    }

    if (gyroData.alpha !== null) {
      if (gyroData.alpha >= GYRO_LEFT_MIN && gyroData.alpha <= GYRO_LEFT_MAX) {
        playerX.current -= PLAYER_MOVE_SPEED;
      } else if (gyroData.alpha >= GYRO_RIGHT_MIN && gyroData.alpha <= GYRO_RIGHT_MAX) {
        playerX.current += PLAYER_MOVE_SPEED;
      }
    }

    playerX.current = clamp(
      playerX.current,
      PLAYER_BOUNDS_PADDING,
      GAME_WIDTH - PLAYER_WIDTH - PLAYER_BOUNDS_PADDING
    );

    // spawn counters
    spawnCounter.current.banana += metersThisFrame;
    spawnCounter.current.obstacle += metersThisFrame;

    if (spawnCounter.current.banana >= BANANA_SPAWN_INTERVAL) {
      spawnCounter.current.banana = 0;
      if (Math.random() < BANANA_SPAWN_CHANCE) {
        const x = Math.random() * (GAME_WIDTH - OBJECT_SIZE);
        objects.current.push({
          id: nextId.current++, type:'banana', x, y:-OBJECT_SIZE, w:OBJECT_SIZE, h:OBJECT_SIZE, vy:CLOUD_SPEED
        });
      }
    }

    let obstacleChance =
      INITIAL_OBSTACLE_SPAWN_CHANCE +
      Math.min(
        Math.floor(distanceM.current / OBSTACLE_CHANCE_INCREASE_INTERVAL) * OBSTACLE_CHANCE_INCREASE_AMOUNT,
        MAX_OBSTACLE_SPAWN_CHANCE - INITIAL_OBSTACLE_SPAWN_CHANCE
      );

    if (spawnCounter.current.obstacle >= OBSTACLE_SPAWN_INTERVAL) {
      spawnCounter.current.obstacle = 0;
      if (Math.random() < obstacleChance) {
        const types: GameObjectType[] = ['cloudA', 'cloudB', 'crow', 'birdLeft', 'birdRight'];
        const t = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (GAME_WIDTH - OBJECT_SIZE);
        const vy = t === 'crow' ? CROW_SPEED : (t === 'birdLeft' || t === 'birdRight') ? BIRD_SPEED : CLOUD_SPEED;
        objects.current.push({ id: nextId.current++, type: t, x, y:-OBJECT_SIZE, w:OBJECT_SIZE, h:OBJECT_SIZE, vy });
      }
    }

    // move & cull
    objects.current.forEach(o => { o.y += o.vy; });
    objects.current = objects.current.filter(o => o.y < GAME_HEIGHT + 40);

    // collisions
    const px = playerX.current, py = PLAYER_START_Y, pw = PLAYER_WIDTH, ph = PLAYER_HEIGHT;
    const hit = (ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number) =>
      ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

    for (const o of objects.current) {
      if (hit(px, py, pw, ph, o.x, o.y, o.w, o.h)) {
        if (o.type === 'banana') {
          distanceM.current += 10;
          objects.current = objects.current.filter(x => x.id !== o.id);
          audioManager.play('banana');
        } else if (o.type === 'crow' || o.type === 'birdLeft' || o.type === 'birdRight') {
          running.current = false;
          audioManager.play('hit');
          onGameOver(distanceM.current);
          break;
        }
      }
    }

    setHudDistance(distanceM.current);
  }, [gyroData.alpha, onGameOver]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#56B0F5';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const bg = assetImages.gameBg;
    if (bg) ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);

    const playerImg = assetImages.kumorin;
    if (playerImg) ctx.drawImage(playerImg, playerX.current, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
    else { ctx.fillStyle = '#ff0'; ctx.fillRect(playerX.current, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT); }

    for (const o of objects.current) {
      const img = assetImages[o.type];
      if (img) ctx.drawImage(img, o.x, o.y, o.w, o.h);
      else { ctx.fillStyle = '#000'; ctx.fillRect(o.x, o.y, o.w, o.h); }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.fillText(`${Math.floor(hudDistance)} m`, 20, 60);
  }, [hudDistance]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const loop = (t:number) => {
      if (!running.current) return;
      if (lastTime.current === null) lastTime.current = t;
      const dt = t - lastTime.current; lastTime.current = t;

      update(dt);
      draw(ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => { running.current = false; };
  }, [draw, update]);

  // PCテスト（左右キー）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') playerX.current -= PLAYER_MOVE_SPEED;
      if (e.key === 'ArrowRight') playerX.current += PLAYER_MOVE_SPEED;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-blue-400">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT}
              style={{ width: '100vw', height: '100vh', objectFit: 'contain' }} />
    </div>
  );
};

export default GameScreen;
