export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  points: number;
}

export interface LevelConfig {
  name: string;
  points: number;
}