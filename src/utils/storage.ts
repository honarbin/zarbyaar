import { UserStats, DifficultyLevel, Question, WeaknessItem, Badge } from '../types';

const STORAGE_KEY = 'zarbyar_user_data_v1';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_practice',
    title: 'قدم اول 🐾',
    description: 'انجام اولین تمرین جدول ضرب',
    icon: '🎯',
    requiredPractices: 1,
  },
  {
    id: 'streak_5',
    title: 'تمرکز عالی ⚡',
    description: 'پاسخ صحیح به ۵ سؤال متوالی',
    icon: '🔥',
    requiredStreak: 5,
  },
  {
    id: 'streak_10',
    title: 'زنجیره طلایی 🌟',
    description: 'پاسخ صحیح به ۱۰ سؤال متوالی',
    icon: '👑',
    requiredStreak: 10,
  },
  {
    id: 'speed_master',
    title: 'قهرمان سرعت ⚡',
    description: 'کسب بیش از ۱۰۰ امتیاز در مسابقه سرعتی',
    icon: '🚀',
    requiredScore: 100,
  },
  {
    id: 'practice_10',
    title: 'کوشا و قهرمان 📚',
    description: 'تکمیل ۱۰ دوره تمرین',
    icon: '🏆',
    requiredPractices: 10,
  },
  {
    id: 'score_500',
    title: 'استاد ضرب‌بار 🧙‍♂️',
    description: 'رسیدن به مجموع ۵۰۰ امتیاز',
    icon: '⭐',
    requiredScore: 500,
  },
];

export const INITIAL_USER_STATS: UserStats = {
  username: 'قهرمان کوچک',
  avatar: 'fox',
  totalScore: 0,
  highScore: 0,
  maxStreak: 0,
  bestSpeedScore: 0,
  totalPractices: 0,
  totalCorrect: 0,
  totalWrong: 0,
  soundEnabled: true,
  tableStats: {},
  unlockedBadges: ['first_practice'],
  selectedHat: 'none',
  selectedGlasses: 'none',
  selectedAccessory: 'none',
};

export const loadUserStats = (): UserStats => {
  if (typeof window === 'undefined') return INITIAL_USER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATS;
    const data = JSON.parse(raw);
    const stats = { ...INITIAL_USER_STATS, ...data };
    
    // Migrate old emoji avatars to modern character IDs
    const validCharacters = ['robot', 'fox', 'panda', 'cat'];
    if (!validCharacters.includes(stats.avatar)) {
      stats.avatar = 'fox';
    }
    
    if (!stats.selectedHat) stats.selectedHat = 'none';
    if (!stats.selectedGlasses) stats.selectedGlasses = 'none';
    if (!stats.selectedAccessory) stats.selectedAccessory = 'none';
    
    return stats;
  } catch {
    return INITIAL_USER_STATS;
  }
};

export const saveUserStats = (stats: UserStats): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
};

// Record question outcome for adaptive difficulty analytics
export const recordQuestionResult = (
  stats: UserStats,
  f1: number,
  f2: number,
  isCorrect: boolean
): UserStats => {
  const key = `${Math.min(f1, f2)}x${Math.max(f1, f2)}`;
  const current = stats.tableStats[key] || {
    factor1: Math.min(f1, f2),
    factor2: Math.max(f1, f2),
    attempts: 0,
    correct: 0,
    wrong: 0,
  };

  const updatedTableStat = {
    ...current,
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    wrong: current.wrong + (isCorrect ? 0 : 1),
  };

  const newStats: UserStats = {
    ...stats,
    totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
    totalWrong: stats.totalWrong + (isCorrect ? 0 : 1),
    tableStats: {
      ...stats.tableStats,
      [key]: updatedTableStat,
    },
  };

  return newStats;
};

// Calculate progress for a specific multiplication table (1 to 10)
export interface TableProgressInfo {
  masteredCount: number;
  totalCount: number;
  percentage: number;
  stars: number; // 0 to 3
}

export const getTableProgress = (stats: UserStats, tableNum: number): TableProgressInfo => {
  let masteredCount = 0;
  const totalCount = 10;

  for (let m = 1; m <= 10; m++) {
    const key = `${Math.min(tableNum, m)}x${Math.max(tableNum, m)}`;
    const stat = stats.tableStats?.[key];
    if (stat && stat.correct > 0) {
      masteredCount++;
    }
  }

  const percentage = Math.round((masteredCount / totalCount) * 100);
  let stars = 0;
  if (masteredCount >= 10) {
    stars = 3;
  } else if (masteredCount >= 6) {
    stars = 2;
  } else if (masteredCount >= 2) {
    stars = 1;
  }

  return {
    masteredCount,
    totalCount,
    percentage,
    stars,
  };
};

export interface TableDetailedStats {
  tableNum: number;
  masteredCount: number;
  totalCount: number;
  percentage: number;
  stars: number;
  totalAttempts: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  status: 'not_started' | 'learning' | 'good' | 'mastered';
  statusLabel: string;
}

export const getTableDetailedStats = (stats: UserStats, tableNum: number): TableDetailedStats => {
  let masteredCount = 0;
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  const totalCount = 10;

  for (let m = 1; m <= 10; m++) {
    const key = `${Math.min(tableNum, m)}x${Math.max(tableNum, m)}`;
    const stat = stats.tableStats?.[key];
    if (stat) {
      totalAttempts += stat.attempts || 0;
      totalCorrect += stat.correct || 0;
      totalWrong += stat.wrong || 0;
      if (stat.correct > 0) {
        masteredCount++;
      }
    }
  }

  const percentage = Math.round((masteredCount / totalCount) * 100);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  let stars = 0;
  if (masteredCount >= 10 && accuracy >= 80) {
    stars = 3;
  } else if (masteredCount >= 6) {
    stars = 2;
  } else if (masteredCount >= 2) {
    stars = 1;
  }

  let status: 'not_started' | 'learning' | 'good' | 'mastered' = 'not_started';
  let statusLabel = 'شروع نشده';

  if (totalAttempts === 0) {
    status = 'not_started';
    statusLabel = 'شروع نشده';
  } else if (masteredCount === 10 && accuracy >= 85) {
    status = 'mastered';
    statusLabel = 'عالی';
  } else if (masteredCount >= 6 || (totalAttempts >= 5 && accuracy >= 70)) {
    status = 'good';
    statusLabel = 'خوب';
  } else {
    status = 'learning';
    statusLabel = 'در حال یادگیری';
  }

  return {
    tableNum,
    masteredCount,
    totalCount,
    percentage,
    stars,
    totalAttempts,
    totalCorrect,
    totalWrong,
    accuracy,
    status,
    statusLabel,
  };
};

export interface RealMistake {
  factor1: number;
  factor2: number;
  attempts: number;
  correct: number;
  wrong: number;
  errorRate: number;
}

export const getRealMistakesList = (stats: UserStats): RealMistake[] => {
  const mistakes: RealMistake[] = [];
  
  if (!stats.tableStats) return mistakes;

  Object.values(stats.tableStats).forEach((item) => {
    if (item && item.wrong > 0) {
      mistakes.push({
        factor1: item.factor1,
        factor2: item.factor2,
        attempts: item.attempts,
        correct: item.correct,
        wrong: item.wrong,
        errorRate: item.attempts > 0 ? item.wrong / item.attempts : 1,
      });
    }
  });

  // Sort by highest mistake count descending, then by attempts
  mistakes.sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate || b.attempts - a.attempts);

  return mistakes;
};

export interface SmartRecommendation {
  type: 'start' | 'fix_mistake' | 'improve_table' | 'new_table' | 'speed_challenge';
  title: string;
  description: string;
  tableTarget?: number;
  highlightPair?: { factor1: number; factor2: number; wrongCount: number };
  actionLabel: string;
  badgeText: string;
}

export const getSmartRecommendation = (stats: UserStats): SmartRecommendation => {
  const totalAnswers = stats.totalCorrect + stats.totalWrong;

  // Case 1: Fresh user / No practice yet
  if (totalAnswers === 0 || stats.totalPractices === 0) {
    return {
      type: 'start',
      title: 'آغاز مسیر طلایی یادگیری ضرب',
      description: 'کودک شما هنوز تمرینی ثبت نکرده است. بهترین نقطه برای شروع و افزایش اعتمادبه‌نفس، تمرین جدول‌های پایه‌ای ۲ و ۳ است.',
      tableTarget: 2,
      actionLabel: 'شروع تمرین جدول ۲',
      badgeText: 'گام نخست 🌱',
    };
  }

  // Case 2: Specific frequent mistakes exist
  const mistakes = getRealMistakesList(stats);
  const severeMistake = mistakes.find((m) => m.wrong >= 2);
  if (severeMistake) {
    return {
      type: 'fix_mistake',
      title: `تثبیت ضرب ${severeMistake.factor1} × ${severeMistake.factor2}`,
      description: `کودک در ضرب ${severeMistake.factor1} × ${severeMistake.factor2} با ${severeMistake.wrong} بار خطای ثبت‌شده نیاز به مرور دارد. تمرین روی جدول ${severeMistake.factor1} به درک بهتر الگو کمک خواهد کرد.`,
      tableTarget: severeMistake.factor1,
      highlightPair: {
        factor1: severeMistake.factor1,
        factor2: severeMistake.factor2,
        wrongCount: severeMistake.wrong,
      },
      actionLabel: `تمرین جدول ${severeMistake.factor1}`,
      badgeText: 'اولویت مرور 🎯',
    };
  }

  // Case 3: A table has weak accuracy or many wrongs
  const tableStatsList: TableDetailedStats[] = [];
  for (let i = 1; i <= 10; i++) {
    tableStatsList.push(getTableDetailedStats(stats, i));
  }

  // Find table with lowest accuracy among attempted tables that have wrong > 0
  const attemptedWithWrongs = tableStatsList.filter((t) => t.totalAttempts > 0 && t.totalWrong > 0);
  if (attemptedWithWrongs.length > 0) {
    attemptedWithWrongs.sort((a, b) => a.accuracy - b.accuracy || b.totalWrong - a.totalWrong);
    const weakest = attemptedWithWrongs[0];
    return {
      type: 'improve_table',
      title: `بهبود دقت در جدول ${weakest.tableNum}`,
      description: `جدول ${weakest.tableNum} با دقت %${weakest.accuracy} و ${weakest.totalWrong} پاسخ اشتباه نیاز به تمرین و تثبیت بیشتری دارد تا به وضعیت عالی ارتقا یابد.`,
      tableTarget: weakest.tableNum,
      actionLabel: `تمرین جدول ${weakest.tableNum}`,
      badgeText: 'نیاز به تمرین 📈',
    };
  }

  // Case 4: Tables in learning phase (low mastered count)
  const learningTables = tableStatsList.filter((t) => t.totalAttempts > 0 && t.percentage < 100);
  if (learningTables.length > 0) {
    learningTables.sort((a, b) => a.percentage - b.percentage);
    const target = learningTables[0];
    return {
      type: 'improve_table',
      title: `تکمیل یادگیری جدول ${target.tableNum}`,
      description: `کودک ${target.masteredCount} ضرب از ۱۰ ضرب جدول ${target.tableNum} را فراگرفته است. با یک دور تمرین، این جدول را ۱۰۰٪ کنید.`,
      tableTarget: target.tableNum,
      actionLabel: `تکمیل جدول ${target.tableNum}`,
      badgeText: 'در حال رشد 🌱',
    };
  }

  // Case 5: Unstarted tables
  const unstarted = tableStatsList.filter((t) => t.totalAttempts === 0);
  if (unstarted.length > 0) {
    const nextTable = unstarted[0];
    return {
      type: 'new_table',
      title: `یادگیری جدول جدید: جدول ${nextTable.tableNum}`,
      description: `عملکرد کودک در جدول‌های قبلی بسیار خوب بوده است! گام منطقی بعدی، آغاز یادگیری جدول ${nextTable.tableNum} است.`,
      tableTarget: nextTable.tableNum,
      actionLabel: `شروع یادگیری جدول ${nextTable.tableNum}`,
      badgeText: 'مرحله جدید 🚀',
    };
  }

  // Case 6: Mastered everything - recommend speed challenge
  return {
    type: 'speed_challenge',
    title: 'تسلط کامل و چالش سرعت و تمرکز',
    description: 'تسلط کودک بر تمام جدول‌های ضرب فوق‌العاده است! برای افزایش سرعت عمل و واکنش ذهنی، مسابقه ۶۰ ثانیه‌ای سرعتی عالی‌ترین انتخاب است.',
    actionLabel: 'ورود به مسابقه سرعتی',
    badgeText: 'سطح استادی 👑',
  };
};

export const getTotalStars = (stats: UserStats): number => {
  let total = 0;
  for (let i = 1; i <= 10; i++) {
    total += getTableProgress(stats, i).stars;
  }
  return total;
};

// Check for newly unlocked badges
export const checkBadges = (stats: UserStats): UserStats => {
  const unlocked = new Set(stats.unlockedBadges || []);

  ALL_BADGES.forEach((badge) => {
    if (unlocked.has(badge.id)) return;

    let shouldUnlock = false;
    if (badge.requiredPractices && stats.totalPractices >= badge.requiredPractices) {
      shouldUnlock = true;
    }
    if (badge.requiredStreak && stats.maxStreak >= badge.requiredStreak) {
      shouldUnlock = true;
    }
    if (badge.requiredScore && stats.totalScore >= badge.requiredScore) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      unlocked.add(badge.id);
    }
  });

  return {
    ...stats,
    unlockedBadges: Array.from(unlocked),
  };
};

// Compute Weaknesses (Top multiplication pairs with highest error counts)
export const getWeaknessList = (stats: UserStats): WeaknessItem[] => {
  const items: WeaknessItem[] = [];

  Object.values(stats.tableStats).forEach((item) => {
    if (item.attempts >= 2 && item.wrong > 0) {
      items.push({
        factor1: item.factor1,
        factor2: item.factor2,
        attempts: item.attempts,
        correct: item.correct,
        wrong: item.wrong,
        errorRate: item.wrong / item.attempts,
      });
    }
  });

  // Sort primarily by highest wrong count, then highest error rate
  items.sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate);

  // If child hasn't made mistakes yet or has very few recorded, provide common tricky multiplication defaults
  if (items.length < 3) {
    const defaultTricky = [
      { factor1: 7, factor2: 8 },
      { factor1: 6, factor2: 9 },
      { factor1: 8, factor2: 7 },
      { factor1: 7, factor2: 9 },
      { factor1: 6, factor2: 8 },
    ];

    for (const d of defaultTricky) {
      if (items.length >= 5) break;
      const key = `${Math.min(d.factor1, d.factor2)}x${Math.max(d.factor1, d.factor2)}`;
      if (!items.some((i) => `${i.factor1}x${i.factor2}` === key)) {
        items.push({
          factor1: d.factor1,
          factor2: d.factor2,
          attempts: 0,
          correct: 0,
          wrong: 0,
          errorRate: 0,
        });
      }
    }
  }

  return items;
};

// Adaptive weighted question selection algorithm
export const generateQuestion = (
  level: DifficultyLevel,
  stats: UserStats,
  specificTable?: number | number[]
): Question => {
  let allowedTables: number[] = [];

  if (specificTable !== undefined && specificTable !== null) {
    if (Array.isArray(specificTable)) {
      allowedTables = specificTable.length > 0 ? specificTable : Array.from({ length: 10 }, (_, i) => i + 1);
    } else {
      allowedTables = [specificTable];
    }
  } else if (level === 'easy') {
    allowedTables = [1, 2, 3, 4, 5];
  } else if (level === 'medium') {
    allowedTables = [1, 2, 3, 4, 5, 6, 7];
  } else if (level === 'hard') {
    allowedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else if (level === 'weaknesses') {
    const weaknesses = getWeaknessList(stats);
    if (weaknesses.length > 0) {
      const picked = weaknesses[Math.floor(Math.random() * Math.min(weaknesses.length, 5))];
      // Randomly decide order (e.g. 7x8 or 8x7)
      const flip = Math.random() > 0.5;
      const f1 = flip ? picked.factor1 : picked.factor2;
      const f2 = flip ? picked.factor2 : picked.factor1;
      return createQuestionWithChoices(f1, f2);
    }
    allowedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else {
    allowedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // Generate potential candidates
  const pool: { f1: number; f2: number; weight: number }[] = [];

  for (const f1 of allowedTables) {
    for (let f2 = 1; f2 <= 10; f2++) {
      const key = `${Math.min(f1, f2)}x${Math.max(f1, f2)}`;
      const stat = stats.tableStats[key];
      let weight = 1;

      if (stat && stat.attempts > 0) {
        // Higher weight if wrong answers are frequent
        const wrongRatio = stat.wrong / stat.attempts;
        weight += stat.wrong * 2 + wrongRatio * 3;
      } else {
        // Unattempted questions get a slightly higher weight to encourage learning
        weight = 1.5;
      }

      pool.push({ f1, f2, weight });
    }
  }

  // Weighted random pick
  const totalWeight = pool.reduce((acc, curr) => acc + curr.weight, 0);
  let randomVal = Math.random() * totalWeight;

  let selected = pool[0] || { f1: 2, f2: 3, weight: 1 };
  for (const item of pool) {
    if (randomVal <= item.weight) {
      selected = item;
      break;
    }
    randomVal -= item.weight;
  }

  return createQuestionWithChoices(selected.f1, selected.f2);
};

// Generate 4 plausible multiple choice options (including correct answer)
export const createQuestionWithChoices = (f1: number, f2: number): Question => {
  const correctAnswer = f1 * f2;
  const optionsSet = new Set<number>();
  optionsSet.add(correctAnswer);

  // Generate plausible distractors close to correct answer
  const possibleDistractors = [
    correctAnswer + f1,
    correctAnswer - f1,
    correctAnswer + f2,
    correctAnswer - f2,
    correctAnswer + 10,
    correctAnswer - 10,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    (f1 + 1) * f2,
    (f1 - 1) * f2,
  ];

  // Shuffle distractors
  possibleDistractors.sort(() => Math.random() - 0.5);

  for (const d of possibleDistractors) {
    if (optionsSet.size >= 4) break;
    if (d > 0 && d <= 100 && d !== correctAnswer) {
      optionsSet.add(d);
    }
  }

  // Fallback random choices if set < 4
  while (optionsSet.size < 4) {
    const randomDistractor = Math.max(1, correctAnswer + Math.floor(Math.random() * 20) - 10);
    if (randomDistractor !== correctAnswer) {
      optionsSet.add(randomDistractor);
    }
  }

  const options = Array.from(optionsSet);
  // Shuffle options so correct answer is in random position
  options.sort(() => Math.random() - 0.5);

  return {
    factor1: f1,
    factor2: f2,
    answer: correctAnswer,
    options,
  };
};
