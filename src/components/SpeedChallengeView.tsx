import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Clock,
  Trophy,
  Flame,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Check,
  Grid,
  BookOpen,
  RefreshCw,
  Star,
  CheckCircle,
  HelpCircle,
  Timer,
  SlidersHorizontal,
  ChevronRight,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { UserStats, Question } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';
import {
  generateQuestion,
  recordQuestionResult,
  saveUserStats,
  checkBadges,
  createQuestionWithChoices,
} from '../utils/storage';
import { MathFormula } from './MathFormula';
import { GameCharacter } from './GameCharacter';

export interface SpeedMistake {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
}

export type ChallengeMode = 'timed' | 'untimed';

interface SpeedChallengeProps {
  stats: UserStats;
  initialTable?: number | null;
  onUpdateStats: (newStats: UserStats) => void;
  onBackToMenu: () => void;
}

const POSITIVE_MESSAGES = [
  'آفرین! 👏',
  'عالی بود! ⭐',
  'درست گفتی! 🚀',
  'فوق‌العاده! 🌟',
  'بی‌نظیر! 🔥',
  'ماشالله قهرمان! ✨',
];

export const SpeedChallengeView: React.FC<SpeedChallengeProps> = ({
  stats,
  initialTable,
  onUpdateStats,
  onBackToMenu,
}) => {
  // Mode Settings
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>('timed');
  const [timeDuration, setTimeDuration] = useState<number>(60); // 30, 60, 90 seconds
  const [untimedQuestionCount, setUntimedQuestionCount] = useState<number>(10); // 10, 15, 20, 30 questions

  // Selected tables for challenge: default to initialTable if provided, else 1 to 10
  const [selectedTables, setSelectedTables] = useState<number[]>(() => {
    if (initialTable && initialTable >= 1 && initialTable <= 10) {
      return [initialTable];
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  });

  // Game Flow States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Instant inline feedback during gameplay
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedOption: number;
    correctAnswer: number;
    message: string;
  } | null>(null);

  // List of mistakes recorded during this session
  const [mistakes, setMistakes] = useState<SpeedMistake[]>([]);

  // Retry mistakes practice mode state
  const [isReviewingMistakes, setIsReviewingMistakes] = useState<boolean>(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<{
    isCorrect: boolean;
    selectedOption: number;
  } | null>(null);
  const [reviewCompleted, setReviewCompleted] = useState<boolean>(false);

  const soundEnabled = stats.soundEnabled;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(0);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Toggle table selection
  const handleToggleTable = (num: number) => {
    sounds.playDing();
    if (selectedTables.includes(num)) {
      if (selectedTables.length > 1) {
        setSelectedTables(selectedTables.filter((t) => t !== num));
      }
    } else {
      setSelectedTables([...selectedTables, num].sort((a, b) => a - b));
    }
  };

  // Preset selectors
  const handleSelectAll = () => {
    sounds.playDing();
    setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  };

  const handleSelectOnlyInitial = (num: number) => {
    sounds.playDing();
    setSelectedTables([num]);
  };

  const handleSelectRange = (from: number, to: number) => {
    sounds.playDing();
    const range: number[] = [];
    for (let i = from; i <= to; i++) range.push(i);
    setSelectedTables(range);
  };

  const getSelectionDescription = () => {
    if (selectedTables.length === 10) {
      return 'تمام جدول‌های ۱ تا ۱۰';
    }
    if (selectedTables.length === 1) {
      return `فقط جدول ${toPersianDigits(selectedTables[0])}`;
    }
    return `جدول‌های ${selectedTables.map((t) => toPersianDigits(t)).join('، ')}`;
  };

  // Countdown & Elapsed Timer Hook
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished) {
      timer = setInterval(() => {
        if (challengeMode === 'timed') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, challengeMode, isFinished]);

  // When timer hits 0 in timed mode, safely trigger game finish
  useEffect(() => {
    if (isPlaying && !isFinished && challengeMode === 'timed' && timeLeft === 0) {
      handleFinishGame();
    }
  }, [timeLeft, isPlaying, isFinished, challengeMode]);

  // Start Speed Challenge / Untimed Practice
  const startGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sounds.playDing();
    setIsPlaying(true);
    setTimeLeft(timeDuration);
    setElapsedTime(0);
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setFeedback(null);
    setMistakes([]);
    setIsReviewingMistakes(false);
    setReviewCompleted(false);
    gameStartTimeRef.current = Date.now();

    const firstQ = generateQuestion('hard', stats, selectedTables);
    setCurrentQuestion(firstQ);
  };

  // Handle Answer Choice
  const handleAnswer = (option: number) => {
    if (!isPlaying || isFinished || !currentQuestion || feedback) return;

    const isCorrect = option === currentQuestion.answer;
    let addedScore = 0;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      addedScore = 10 + Math.min(newCombo * 2, 20); // combo bonus
      setScore((prev) => prev + addedScore);
      setCorrectCount((prev) => prev + 1);

      if (soundEnabled) sounds.playCorrectSound();
      const msg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
      setFeedback({
        isCorrect: true,
        selectedOption: option,
        correctAnswer: currentQuestion.answer,
        message: msg,
      });
    } else {
      setCombo(0);
      setWrongCount((prev) => prev + 1);
      if (soundEnabled) sounds.playWrongSound();

      // Record mistake for review and smart practice
      const newMistake: SpeedMistake = {
        factor1: currentQuestion.factor1,
        factor2: currentQuestion.factor2,
        userAnswer: option,
        correctAnswer: currentQuestion.answer,
      };
      setMistakes((prev) => [...prev, newMistake]);

      setFeedback({
        isCorrect: false,
        selectedOption: option,
        correctAnswer: currentQuestion.answer,
        message: `اشکالی نداره! پاسخ درست: ${toPersianDigits(currentQuestion.answer)} 🌱`,
      });
    }

    // Update table accuracy stats (connects directly to overall progress)
    const updatedUserStats = recordQuestionResult(
      stats,
      currentQuestion.factor1,
      currentQuestion.factor2,
      isCorrect
    );
    onUpdateStats(updatedUserStats);

    // Transition timing: snappy 350ms for correct, 750ms for wrong so correct answer is clearly seen
    const transitionDelay = isCorrect ? 350 : 750;

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      const nextIndex = questionIndex + 1;

      // Check max questions limit depending on mode
      const maxQ = challengeMode === 'untimed' ? untimedQuestionCount : 30;

      if (nextIndex >= maxQ) {
        handleFinishGame();
      } else {
        setQuestionIndex(nextIndex);
        const nextQ = generateQuestion('hard', stats, selectedTables);
        setCurrentQuestion(nextQ);
      }
    }, transitionDelay);
  };

  // Finish Speed Challenge / Practice
  const handleFinishGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFinished(true);
    setIsPlaying(false);
    setFeedback(null);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Save records
    let newStats: UserStats = {
      ...stats,
      bestSpeedScore: challengeMode === 'timed' ? Math.max(stats.bestSpeedScore, score) : stats.bestSpeedScore,
      totalScore: stats.totalScore + score,
      highScore: Math.max(stats.highScore, stats.totalScore + score),
      maxStreak: Math.max(stats.maxStreak, maxCombo),
    };

    newStats = checkBadges(newStats);
    saveUserStats(newStats);
    onUpdateStats(newStats);
  };

  // Start Retry Mistakes Practice Mode
  const handleStartReviewPractice = () => {
    if (mistakes.length === 0) return;
    sounds.playDing();
    const shuffledMistakes = [...mistakes].sort(() => Math.random() - 0.5);
    const questions = shuffledMistakes.map((m) =>
      createQuestionWithChoices(m.factor1, m.factor2)
    );
    setReviewQuestions(questions);
    setReviewIndex(0);
    setReviewFeedback(null);
    setReviewCompleted(false);
    setIsReviewingMistakes(true);
  };

  // Handle Answer in Mistakes Practice Mode
  const handleReviewAnswer = (option: number) => {
    if (reviewFeedback || reviewCompleted) return;
    const currentQ = reviewQuestions[reviewIndex];
    if (!currentQ) return;

    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      if (soundEnabled) sounds.playCorrectSound();
      setReviewFeedback({ isCorrect: true, selectedOption: option });
    } else {
      if (soundEnabled) sounds.playWrongSound();
      setReviewFeedback({ isCorrect: false, selectedOption: option });
    }

    // Update stats
    const updated = recordQuestionResult(stats, currentQ.factor1, currentQ.factor2, isCorrect);
    onUpdateStats(updated);

    const delay = isCorrect ? 450 : 850;
    setTimeout(() => {
      setReviewFeedback(null);
      if (reviewIndex + 1 >= reviewQuestions.length) {
        setReviewCompleted(true);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        setReviewIndex((prev) => prev + 1);
      }
    }, delay);
  };

  // ----------------------------------------------------
  // VIEW: RETRY MISTAKES PRACTICE MODE
  // ----------------------------------------------------
  if (isReviewingMistakes) {
    const currentQ = reviewQuestions[reviewIndex];

    if (reviewCompleted) {
      return (
        <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-emerald-300 space-y-6"
          >
            <div className="flex justify-center pb-1">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression="celebration"
                size="lg"
              />
            </div>

            <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                آفرین قهرمان! 🌟
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                همه اشتباه‌ها رو با موفقیت یاد گرفتی! 🎉
              </h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                تمام سؤال‌هایی که اشتباه کرده بودی رو با تمرین دوباره مسلط شدی. حالا آماده‌ای تا رکورد بهتری ثبت کنی!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg border-b-4 border-purple-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <Zap className="w-5 h-5" />
                <span>شروع دوباره چالش</span>
              </button>

              <button
                onClick={() => setIsReviewingMistakes(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-4 px-4 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                <span>بازگشت به کارنامه</span>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-black text-sm">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>تمرین و مرور اشتباهات</span>
          </div>

          <div className="text-xs font-black text-slate-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            سؤال {toPersianDigits(reviewIndex + 1)} از {toPersianDigits(reviewQuestions.length)}
          </div>

          <button
            onClick={() => setIsReviewingMistakes(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1 cursor-pointer"
          >
            خروج از تمرین
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((reviewIndex + (reviewFeedback ? 1 : 0)) / reviewQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-amber-300 space-y-5">
            <div className="flex justify-center -mt-1 pb-1">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression={
                  reviewFeedback
                    ? reviewFeedback.isCorrect
                      ? 'celebration'
                      : 'thinking'
                    : 'idle'
                }
                size="md"
              />
            </div>

            {/* Hint / Support Label */}
            <p className="text-xs font-bold text-amber-800 bg-amber-50 py-1.5 px-3 rounded-full inline-block border border-amber-200">
              این ضرب را با دقت پاسخ بده 🌱
            </p>

            {/* Math Formula Display */}
            <div className="py-4 bg-amber-50/70 rounded-2xl border-2 border-amber-200 shadow-inner flex justify-center items-center">
              <MathFormula
                factor1={currentQ.factor1}
                factor2={currentQ.factor2}
                answer={reviewFeedback ? currentQ.answer : '؟'}
                className="text-slate-900 tracking-wider"
                symbolColor="text-amber-500"
                size="display"
              />
            </div>

            {/* Multiple Choices Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = reviewFeedback?.selectedOption === option;
                const isTheCorrectAnswer = option === currentQ.answer;

                let btnClass = 'bg-amber-50/80 hover:bg-amber-100 text-amber-950 border-amber-200';

                if (reviewFeedback) {
                  if (isTheCorrectAnswer) {
                    btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
                  } else if (isSelected && !reviewFeedback.isCorrect) {
                    btnClass = 'bg-rose-100 text-rose-800 border-rose-400 opacity-90';
                  } else {
                    btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!reviewFeedback}
                    onClick={() => handleReviewAnswer(option)}
                    className={`py-4 px-4 rounded-2xl typo-math-large border-2 shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${btnClass}`}
                  >
                    <span>{toPersianDigits(option)}</span>
                    {reviewFeedback && isTheCorrectAnswer && (
                      <CheckCircle className="w-5 h-5 text-white animate-bounce shrink-0" />
                    )}
                    {reviewFeedback && isSelected && !reviewFeedback.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: START SCREEN & TABLE/MODE SELECTOR
  // ----------------------------------------------------
  if (!isPlaying && !isFinished) {
    const isSingleTableMode = selectedTables.length === 1;
    const singleTableNum = selectedTables[0];

    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-5 text-right">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs px-3.5 py-2 rounded-2xl border-2 border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
            <span>بازگشت</span>
          </button>

          <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>{isSingleTableMode ? `چالش جدول ${toPersianDigits(singleTableNum)}` : 'چالش سرعتی و تمرین'}</span>
          </span>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-purple-300 relative overflow-hidden space-y-2.5">
          <span className="bg-white/20 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-xs inline-block">
            {isSingleTableMode ? `🎯 تمرین اختصاصی جدول ${toPersianDigits(singleTableNum)}` : '⚡ مسابقه سرعتی و تمرین جدول ضرب'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            {isSingleTableMode
              ? `تمرین و چالش جدول ${toPersianDigits(singleTableNum)} 🌟`
              : 'مسابقه و چالش جدول ضرب ⚡'}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-purple-100 leading-relaxed">
            {isSingleTableMode
              ? `می‌توانی این جدول را به‌صورت سرعتی زمان‌دار یا با آرامش و بدون زمان تمرین کنی!`
              : 'حالت زمان‌دار رکوردی یا تمرین آرام بدون زمان را انتخاب کن و تسلطت را بسنج!'}
          </p>
        </div>

        {/* 1. Mode Selector: Timed vs Untimed */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-2.5">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <h3 className="font-black text-sm text-slate-900">۱. انتخاب نوع چالش (زمان‌دار یا بدون زمان):</h3>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setChallengeMode('timed');
                sounds.playDing();
              }}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer active:scale-95 ${
                challengeMode === 'timed'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                  : 'bg-purple-50/50 hover:bg-purple-50 text-slate-700 border-purple-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <Clock className={`w-4 h-4 ${challengeMode === 'timed' ? 'text-amber-300' : 'text-purple-600'}`} />
                <span>زمان‌دار (سرعتی رکوردی)</span>
              </div>
              <span className={`text-[10px] font-bold ${challengeMode === 'timed' ? 'text-purple-100' : 'text-slate-500'}`}>
                مسابقه با شمارش معکوس ⏱️
              </span>
            </button>

            <button
              onClick={() => {
                setChallengeMode('untimed');
                sounds.playDing();
              }}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer active:scale-95 ${
                challengeMode === 'untimed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200'
                  : 'bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <Smile className={`w-4 h-4 ${challengeMode === 'untimed' ? 'text-amber-300' : 'text-emerald-600'}`} />
                <span>بدون زمان (تمرین آرام)</span>
              </div>
              <span className={`text-[10px] font-bold ${challengeMode === 'untimed' ? 'text-emerald-100' : 'text-slate-500'}`}>
                تعداد سؤال مشخص بدون استرس 🧘
              </span>
            </button>
          </div>

          {/* Sub-settings based on active mode */}
          {challengeMode === 'timed' ? (
            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-2">
              <label className="text-xs font-black text-purple-950 flex items-center justify-between">
                <span>مدت زمان مسابقه:</span>
                <span className="text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200 font-black">
                  {toPersianDigits(timeDuration)} ثانیه
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 30, label: '۳۰ ثانیه ⚡' },
                  { sec: 60, label: '۶۰ ثانیه (استاندارد) ⭐' },
                  { sec: 90, label: '۹۰ ثانیه 🏆' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => {
                      setTimeDuration(item.sec);
                      sounds.playDing();
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      timeDuration === item.sec
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-100/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-purple-800 font-bold">
                💡 در مدت زمان انتخاب‌شده، هرچقدر می‌توانی سریع پاسخ بده و کمبوهای طلایی بگیر!
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
              <label className="text-xs font-black text-emerald-950 flex items-center justify-between">
                <span>تعداد سؤالات تمرین:</span>
                <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 font-black">
                  {toPersianDigits(untimedQuestionCount)} سؤال
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { count: 10, label: '۱۰ سؤال 🌱' },
                  { count: 15, label: '۱۵ سؤال ⭐' },
                  { count: 20, label: '۲۰ سؤال 🚀' },
                  { count: 30, label: '۳۰ سؤال 👑' },
                ].map((item) => (
                  <button
                    key={item.count}
                    onClick={() => {
                      setUntimedQuestionCount(item.count);
                      sounds.playDing();
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      untimedQuestionCount === item.count
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-emerald-800 font-bold">
                💡 بدون استرس زمان، با آرامش سؤال‌ها را حل کن و دقتت را به ۱۰۰٪ برسان!
              </p>
            </div>
          )}
        </div>

        {/* 2. Table Selection Panel */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Grid className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  ۲. جدول‌های مورد نظر برای چالش:
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  می‌توانی یک جدول یا ترکیبی از جدول‌ها را انتخاب کنی
                </p>
              </div>
            </div>

            {/* Current Selection summary pill */}
            <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-purple-200">
              {toPersianDigits(selectedTables.length)} جدول فعال
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {initialTable && (
              <button
                onClick={() => handleSelectOnlyInitial(initialTable)}
                className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedTables.length === 1 && selectedTables[0] === initialTable
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                🎯 فقط جدول {toPersianDigits(initialTable)}
              </button>
            )}

            <button
              onClick={handleSelectAll}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 10
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ✨ همه (۱ تا ۱۰)
            </button>

            <button
              onClick={() => handleSelectRange(1, 5)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 5 && selectedTables.every((t) => t <= 5)
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🌱 پایه (۱ تا ۵)
            </button>

            <button
              onClick={() => handleSelectRange(6, 10)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 5 && selectedTables.every((t) => t >= 6)
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🔥 پیشرفته (۶ تا ۱۰)
            </button>
          </div>

          {/* Grid of 10 Tables (5 columns) */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedTables.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleToggleTable(num)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-400 shadow-md ring-2 ring-purple-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                  title={`جدول ${toPersianDigits(num)}`}
                >
                  <span
                    className={`text-base sm:text-lg font-black leading-tight ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {toPersianDigits(num)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-purple-100' : 'text-slate-400'
                    }`}
                  >
                    جدول
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active selection note */}
          <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200 flex items-center gap-2 text-xs font-bold text-purple-900">
            <span className="text-sm">🎯</span>
            <span>
              محدوده سؤال‌ها:{' '}
              <strong className="font-black text-purple-700">
                {getSelectionDescription()}
              </strong>
            </span>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={startGame}
          className={`w-full text-white font-black text-lg sm:text-xl py-4 sm:py-5 rounded-3xl shadow-xl border-b-4 flex items-center justify-center gap-3 cursor-pointer transition-transform active:scale-95 ${
            challengeMode === 'timed'
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 border-purple-800'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-800'
          }`}
        >
          {challengeMode === 'timed' ? (
            <>
              <Zap className="w-6 h-6 animate-bounce" />
              <span>شروع چالش سرعتی ({toPersianDigits(timeDuration)} ثانیه)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-6 h-6" />
              <span>شروع تمرین بدون زمان ({toPersianDigits(untimedQuestionCount)} سؤال)</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: FINISHED / RESULTS & MISTAKES REVIEW SCREEN
  // ----------------------------------------------------
  if (isFinished) {
    const totalAnswered = correctCount + wrongCount;
    const avgSpeed = totalAnswered > 0 && challengeMode === 'timed'
      ? (timeDuration / totalAnswered).toFixed(1)
      : totalAnswered > 0
      ? (elapsedTime / totalAnswered).toFixed(1)
      : '0';

    const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;

    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-purple-300 space-y-6"
        >
          <div className="space-y-2">
            <div className="flex justify-center pb-2">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression="celebration"
                size="lg"
              />
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-full">
              {challengeMode === 'timed'
                ? `⏱️ پایان چالش سرعتی (${toPersianDigits(timeDuration)} ثانیه)`
                : `🧘 پایان تمرین بدون زمان (${toPersianDigits(totalAnswered)} سؤال)`}
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {accuracyPercent === 100 ? 'شگفت‌انگیز و بی‌نقص! 🌟🎉' : 'آفرین قهرمان ضرب! 👏'}
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              عملکرد بسیار درخشانی در تمرین ثبت کردی!
            </p>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">امتیاز کسب‌شده</p>
              <p className="text-xl font-black text-purple-600 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-purple-500 fill-purple-300" />
                {toPersianDigits(score)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">پاسخ‌های صحیح</p>
              <p className="text-xl font-black text-emerald-600">
                {toPersianDigits(correctCount)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">درصد دقت</p>
              <p className="text-xl font-black text-blue-600">
                {toPersianDigits(accuracyPercent)}٪
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">کل سؤالات</p>
              <p className="text-lg font-black text-slate-800">
                {toPersianDigits(totalAnswered)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">بالاترین کمبو 🔥</p>
              <p className="text-lg font-black text-orange-600">
                {toPersianDigits(maxCombo)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs">
              <p className="text-xs text-slate-500 font-bold mb-1">
                {challengeMode === 'timed' ? 'میانگین سرعت' : 'زمان کل'}
              </p>
              <p className="text-lg font-black text-indigo-600">
                {challengeMode === 'timed'
                  ? `${toPersianDigits(avgSpeed)} ث/سؤال`
                  : `${toPersianDigits(elapsedTime)} ثانیه`}
              </p>
            </div>
          </div>

          {/* Active selection in summary */}
          <div className="text-xs font-bold text-slate-600 bg-slate-50 py-2 px-3 rounded-xl border border-slate-200">
            تمرین انجام‌شده در: <strong className="text-purple-700">{getSelectionDescription()}</strong>
          </div>

          {/* Mistakes Review Section */}
          {mistakes.length === 0 ? (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-emerald-600 fill-emerald-200" />
              </div>
              <h3 className="font-black text-emerald-900 text-base">
                فوق‌العاده است! بدون هیچ اشتباهی! 🌟
              </h3>
              <p className="text-xs text-emerald-700 font-bold">
                تمام سؤال‌هایی که پاسخ دادی ۱۰۰٪ درست بود. عالی تلاش کردی!
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/70 rounded-3xl p-4 sm:p-5 border-2 border-amber-200 text-right space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">
                      اشتباه‌هات رو مرور کنیم 💡
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      با مرور این {toPersianDigits(mistakes.length)} ضرب، تسلطت کامل می‌شه
                    </p>
                  </div>
                </div>
              </div>

              {/* Mistakes List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="font-black text-slate-900">
                        {toPersianDigits(m.factor1)} × {toPersianDigits(m.factor2)} =
                      </span>
                      <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {toPersianDigits(m.correctAnswer)}
                      </span>
                    </div>
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                      پاسخ تو: {toPersianDigits(m.userAnswer)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Retry Mistakes Button */}
              <button
                onClick={handleStartReviewPractice}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-md border-b-4 border-amber-700 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
                <span>دوباره تمرین کنیم (مرور {toPersianDigits(mistakes.length)} اشتباه)</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startGame}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg border-b-4 border-purple-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>تلاش دوباره</span>
            </button>

            <button
              onClick={() => {
                setIsFinished(false);
                setIsPlaying(false);
              }}
              className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-black py-3.5 px-4 rounded-2xl border-2 border-purple-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5 text-purple-600" />
              <span>تغییر تنظیمات و جدول‌ها</span>
            </button>

            <button
              onClick={onBackToMenu}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>بازگشت</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: ACTIVE CHALLENGE GAMEPLAY
  // ----------------------------------------------------
  const maxQ = challengeMode === 'untimed' ? untimedQuestionCount : 30;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-purple-200 flex items-center justify-between">
        
        {/* Timer or Untimed indicator */}
        {challengeMode === 'timed' ? (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm sm:text-base ${
              timeLeft <= 10
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-purple-100 text-purple-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{toPersianDigits(timeLeft)} ثانیه</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm">
            <Smile className="w-4 h-4 text-emerald-600" />
            <span>تمرین بدون زمان</span>
          </div>
        )}

        {/* Question Index */}
        <div className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
          سؤال {toPersianDigits(questionIndex + 1)} از {toPersianDigits(maxQ)}
        </div>

        {/* Combo */}
        <div className="flex items-center gap-1 text-purple-600 font-black text-sm">
          <Flame
            className={`w-5 h-5 ${
              combo > 0 ? 'animate-bounce text-orange-500 fill-orange-400' : 'opacity-30'
            }`}
          />
          <span>کمبو: {toPersianDigits(combo)}</span>
        </div>

        {/* End early button in untimed */}
        {challengeMode === 'untimed' && (
          <button
            onClick={handleFinishGame}
            className="text-[11px] font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
          >
            پایان
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            challengeMode === 'timed'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
          }`}
          style={{
            width: `${
              challengeMode === 'timed'
                ? (timeLeft / timeDuration) * 100
                : ((questionIndex + 1) / maxQ) * 100
            }%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-purple-300 space-y-5">
        {/* Dynamic Interactive Character Companion */}
        <div className="flex justify-center -mt-1 pb-1">
          <GameCharacter
            characterId={(stats.avatar as any) || 'fox'}
            expression={
              feedback
                ? feedback.isCorrect
                  ? combo >= 3
                    ? 'celebration'
                    : 'correct'
                  : 'thinking'
                : combo > 3
                ? 'cheering'
                : 'idle'
            }
            size="md"
          />
        </div>

        {/* Score & Feedback Toast */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 min-h-[22px]">
          {feedback ? (
            <span
              className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                feedback.isCorrect
                  ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {feedback.message}
            </span>
          ) : (
            <span className="text-purple-600 font-bold">
              {challengeMode === 'timed' ? '⚡ چالش سرعتی' : '🧘 تمرین آرام و دقیق'}
            </span>
          )}

          <span className="text-purple-700 font-black text-sm">
            امتیاز: {toPersianDigits(score)}
          </span>
        </div>

        {/* Multiplication Question */}
        <div className="py-4 bg-purple-50 rounded-2xl border-2 border-purple-200/80 shadow-inner flex justify-center items-center">
          <MathFormula
            factor1={currentQuestion?.factor1 ?? 1}
            factor2={currentQuestion?.factor2 ?? 1}
            answer={
              feedback ? currentQuestion?.answer ?? '؟' : '؟'
            }
            className="text-slate-900 tracking-wider"
            symbolColor="text-purple-500"
            size="display"
          />
        </div>

        {/* Fast Choices Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = feedback?.selectedOption === option;
            const isTheCorrectAnswer = option === currentQuestion.answer;

            let btnStyle =
              'bg-purple-50 hover:bg-purple-200 text-purple-900 border-purple-200';

            if (feedback) {
              if (isTheCorrectAnswer) {
                btnStyle =
                  'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
              } else if (isSelected && !feedback.isCorrect) {
                btnStyle =
                  'bg-rose-100 text-rose-800 border-rose-400 line-through decoration-rose-500 opacity-90';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!feedback}
                onClick={() => handleAnswer(option)}
                className={`py-4 px-4 rounded-2xl typo-math-large border-2 shadow transition-all active:scale-90 cursor-pointer flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{toPersianDigits(option)}</span>
                {feedback && isTheCorrectAnswer && (
                  <Check className="w-5 h-5 text-white animate-bounce shrink-0" />
                )}
                {feedback && isSelected && !feedback.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
