
export enum GameStatus {
  Loading,
  Title,
  Intro,
  Playing,
  GameOver,
}

export enum GameObjectType {
  Crow,
  MigratoryBird,
  Banana,
  Cloud,
}

export interface GameObject {
  id: number;
  type: GameObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number; // velocity x
  vy: number; // velocity y
  img: HTMLImageElement;
}