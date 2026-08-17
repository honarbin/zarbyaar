export type AppView = 'concept' | 'tricks' | 'summary' | 'practice' | 'learn' | 'speed' | 'records' | 'profile' | 'about' | 'pythagoras' | 'worksheet';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'weaknesses';

export interface MultiplicationStats {
  factor1: number;
  factor2: number;
  attempts: number;
  correct: number;
  wrong: number;
}

export interface UserStats {
  username: string;
  avatar: string; // This will hold the characterId ('robot' | 'fox' | 'panda' | 'cat' or fallback to default)
  totalScore: number;
  highScore: number;
  maxStreak: number;
  bestSpeedScore: number;
  totalPractices: number;
  totalCorrect: number;
  totalWrong: number;
  soundEnabled: boolean;
  tableStats: Record<string, MultiplicationStats>; // key e.g. "7x8"
  unlockedBadges: string[];
  selectedHat?: string;
  selectedGlasses?: string;
  selectedAccessory?: string;
}

export interface Question {
  factor1: number;
  factor2: number;
  answer: number;
  options: number[];
}

export interface PracticeSummary {
  scoreEarned: number;
  correctCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  maxStreakInSession: number;
  stars: number;
  message: string;
}

export interface WeaknessItem {
  factor1: number;
  factor2: number;
  attempts: number;
  correct: number;
  wrong: number;
  errorRate: number; // e.g. wrong / attempts
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredScore?: number;
  requiredStreak?: number;
  requiredPractices?: number;
}
