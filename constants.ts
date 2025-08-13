// Canvas/game size
export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 1920;

// Image assets
export const IMAGE_ASSETS = {
  titleBg: 'https://i.imgur.com/yuOkMHz.png',
  kumorin: 'https://i.imgur.com/0hQMgso.gif',
  soda: 'https://i.imgur.com/4aHLhwq.png',
  gameBg: 'https://i.imgur.com/EfD4uaN.png',
  cloudA: 'https://i.imgur.com/qY1JVuT.png',
  cloudB: 'https://i.imgur.com/0ybVRKX.png',
  crow: 'https://i.imgur.com/TdVc7OM.png',
  birdLeft: 'https://i.imgur.com/RL5f3Ww.png',
  birdRight: 'https://i.imgur.com/gOrPr79.png',
  banana: 'https://i.imgur.com/n4B27qz.png',
};

// Player
export const PLAYER_WIDTH = 220;
export const PLAYER_HEIGHT = 220;
export const PLAYER_START_Y = GAME_HEIGHT - 400;
export const PLAYER_BOUNDS_PADDING = 30;

// Movement
export const PLAYER_MOVE_SPEED = 12;

// Gyroscope thresholds
export const GYRO_LEFT_MIN = 40;
export const GYRO_LEFT_MAX = 60;
export const GYRO_RIGHT_MIN = 300;
export const GYRO_RIGHT_MAX = 320;

// Objects
export const OBJECT_SIZE = 150;
export const CROW_SPEED = 3;
export const BIRD_SPEED = 11;
export const CLOUD_SPEED = 5;

// Gameplay
export const BASE_SPEED_PPS = (100 / 30) * (1000 / 33);
export const SPEED_MULTIPLIERS = [1.0, 1.6, 2.2, 2.8, 3.0];

export const BANANA_SPAWN_INTERVAL = 100;
export const BANANA_SPAWN_CHANCE = 0.4;
export const OBSTACLE_SPAWN_INTERVAL = 50;
export const INITIAL_OBSTACLE_SPAWN_CHANCE = 0.5;
export const OBSTACLE_CHANCE_INCREASE_INTERVAL = 200;
export const OBSTACLE_CHANCE_INCREASE_AMOUNT = 0.05;
export const MAX_OBSTACLE_SPAWN_CHANCE = 0.6;
