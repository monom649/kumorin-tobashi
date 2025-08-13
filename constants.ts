export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 1920;

export const IMAGE_ASSETS = {
  titleBg: 'https://i.imgur.com/yuOkMHz.png',
  kumorin: 'https://i.imgur.com/0hQMgso.gif', // Replaced with user-provided link.
  soda: 'https://i.imgur.com/4aHLhwq.png',
  gameBg: 'https://i.imgur.com/EfD4uaN.png',
  cloudA: 'https://i.imgur.com/qY1JVuT.png',
  cloudB: 'https://i.imgur.com/0ybVRKX.png',
  crow: 'https://i.imgur.com/TdVc7OM.png',
  birdLeft: 'https://i.imgur.com/RL5f3Ww.png', // Left-facing bird
  birdRight: 'https://i.imgur.com/gOrPr79.png', // Right-facing bird
  banana: 'https://i.imgur.com/n4B27qz.png',
};

// Reverting to local file paths as per user instruction and specification document.
// The user's environment is expected to serve these files at the root level.
export const AUDIO_ASSETS = {
  title: 'title.wav',
  soda: 'soda.wav',
  ohno: 'ohno.wav',
  gamestart: 'gamestart.wav',
  item: 'item.wav',
  out: 'out.wav',
  gameover: 'gameover.wav',
  bgm: 'BGM_HURRY.mp3',
};

// Player settings
export const PLAYER_WIDTH = 300;
export const PLAYER_HEIGHT = 300;
export const PLAYER_START_Y = GAME_HEIGHT - PLAYER_HEIGHT - 100;
export const PLAYER_MOVE_SPEED = 15;
export const PLAYER_BOUNDS_PADDING = 50;

// Gyroscope control settings
export const GYRO_LEFT_MIN = 40;
export const GYRO_LEFT_MAX = 60;
export const GYRO_RIGHT_MIN = 300;
export const GYRO_RIGHT_MAX = 320;

// Game object settings
export const OBJECT_SIZE = 150; // was 300
export const CROW_SPEED = 3;
export const BIRD_SPEED = 11;
export const CLOUD_SPEED = 5;

// Gameplay settings
export const BASE_SPEED_PPS = (100 / 30) * (1000/33); // meters per second. 100m in 30s.
export const SPEED_MULTIPLIERS = [1.0, 1.6, 2.2, 2.8, 3.0];
export const BANANA_SPAWN_INTERVAL = 100; // meters
export const BANANA_SPAWN_CHANCE = 0.4;
export const OBSTACLE_SPAWN_INTERVAL = 50; // meters
export const INITIAL_OBSTACLE_SPAWN_CHANCE = 0.5;
export const OBSTACLE_CHANCE_INCREASE_INTERVAL = 200; // meters
export const OBSTACLE_CHANCE_INCREASE_AMOUNT = 0.05;
export const MAX_OBSTACLE_SPAWN_CHANCE = 0.6;