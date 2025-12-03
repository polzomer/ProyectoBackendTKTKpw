import { getActiveUser } from './storage';
import type { LevelConfig } from './types';

export const DEFAULT_VIEWER_LEVELS: LevelConfig[] = (() => {
  const base = 50;
  const growth = 0.3;
  const names = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Maestro I', 'Maestro II', 'Maestro III', 'Maestro IV', 'Maestro V', 'Dios'];
  const levels: LevelConfig[] = [];
  let threshold = 0;
  let range = base;
  for (let i = 0; i < names.length; i++) {
    levels.push({ name: names[i], points: threshold });
    threshold = threshold + (i === 0 ? base : range);
    range = Math.ceil(range * (1 + growth));
  }
  return levels;
})();

const STREAMER_LEVELS = [
  { name: 'Bronce', hours: 0 },
  { name: 'Plata', hours: 1 / 60 },
  { name: 'Oro', hours: 5 / 60 },
  { name: 'Diamante', hours: 10 / 60 },
  { name: 'Maestro', hours: 60 / 60 },
];

function getEffectiveViewerLevels(): LevelConfig[] {
  const user = getActiveUser();
  if (user?.viewerLevelConfig && user.viewerLevelConfig.length > 0) {
    return user.viewerLevelConfig;
  }
  return DEFAULT_VIEWER_LEVELS;
}

export function getLevelInfo(userPoints: number) {
  const viewerLevels = getEffectiveViewerLevels();
  const user = getActiveUser();
  const name = (user as any)?.nivel_actual as string | undefined;

  if (name) {
    const idx = viewerLevels.findIndex(l => l.name === name);
    const currentLevelIndex = idx >= 0 ? idx : 0;
    const currentLevel = viewerLevels[currentLevelIndex];
    const nextLevel = viewerLevels[currentLevelIndex + 1];
    if (!nextLevel) {
      return {
        currentLevelName: currentLevel.name,
        nextLevelName: null,
        pointsToNextLevel: 0,
        progressPercentage: 100,
      };
    }
    const pointsRange = nextLevel.points - currentLevel.points;
    const progressPercentage = Math.floor((userPoints / pointsRange) * 100);
    return {
      currentLevelName: currentLevel.name,
      nextLevelName: nextLevel.name,
      pointsToNextLevel: Math.max(0, pointsRange - userPoints),
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    };
  }

  let currentLevelIndex = 0;
  for (let i = viewerLevels.length - 1; i >= 0; i--) {
    if (userPoints >= viewerLevels[i].points) {
      currentLevelIndex = i;
      break;
    }
  }

  const currentLevel = viewerLevels[currentLevelIndex];
  const nextLevel = viewerLevels[currentLevelIndex + 1];

  if (!nextLevel) {
    return {
      currentLevelName: currentLevel.name,
      nextLevelName: null,
      pointsToNextLevel: 0,
      progressPercentage: 100,
    };
  }

  const pointsOfCurrentLevel = currentLevel.points;
  const pointsForNextLevel = nextLevel.points;
  const pointsInThisLevel = userPoints - pointsOfCurrentLevel;
  const pointsRange = pointsForNextLevel - pointsOfCurrentLevel;
  const progressPercentage = Math.floor((pointsInThisLevel / pointsRange) * 100);

  return {
    currentLevelName: currentLevel.name,
    nextLevelName: nextLevel.name,
    pointsToNextLevel: pointsForNextLevel - userPoints,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
  };
}

export function getStreamerLevelInfo(streamerHours: number) {
  let currentLevelIndex = 0;
  for (let i = STREAMER_LEVELS.length - 1; i >= 0; i--) {
    if (streamerHours >= STREAMER_LEVELS[i].hours) {
      currentLevelIndex = i;
      break;
    }
  }

  const currentLevel = STREAMER_LEVELS[currentLevelIndex];
  const nextLevel = STREAMER_LEVELS[currentLevelIndex + 1];

  if (!nextLevel) {
    return { levelName: currentLevel.name, hoursToNext: 0, progress: 100 };
  }

  const hoursInThisLevel = streamerHours - currentLevel.hours;
  const hoursRange = nextLevel.hours - currentLevel.hours;
  const progress = Math.floor((hoursInThisLevel / hoursRange) * 100);

  return {
    levelName: currentLevel.name,
    hoursToNext: nextLevel.hours - streamerHours,
    progress: progress,
  };
}

