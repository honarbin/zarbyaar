import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Star, Clock, Trophy, Flame, RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles, BrainCircuit } from 'lucide-react';
import { UserStats, DifficultyLevel, Question, PracticeSummary } from '../types';
import { toPersianDigits, formatTimePersian, sounds } from '../utils/persian';
import { generateQuestion, recordQuestionResult, saveUserStats, checkBadges, getWeaknessList } from '../utils/storage';
import { MathFormula } from './MathFormula';
import { GameCharacter } from './GameCharacter';


interface PracticeViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onNavigateToLearn: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ stats, onUpdateStats, onNavigateToLearn }) => {
  // State for game flow
  const [level, setLevel] = useState<DifficultyLevel | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; pointsEarned: number } | null>(null);
  
  // Session tracking
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreakInSession, setMaxStreakInSession] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);

  // Sound ref flag
  const soundEnabled = stats.soundEnabled;

  const weaknesses = getWeaknessList(stats);

  // Start new practice session
  const startPractice = (selectedLevel: DifficultyLevel) => {
    setLevel(selectedLevel);
    setQuestionIndex(0);
    setSessionScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentStreak(0);
    setMaxStreakInSession(0);
    setSummary(null);
    setStartTime(Date.now());

    const firstQ = generateQuestion(selectedLevel, stats);
    setCurrentQuestion(firstQ);
    setQuestionStartTime(Date.now());
    setIsAnswered(false);
    setSelectedOption(null);
    setFeedback(null);
  };

  // Handle option selection
  const handleSelectOption = (option: number) => {
    if (isAnswered || !currentQuestion || !level) return;

    const answerTimeSeconds = (Date.now() - questionStartTime) / 1000;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.answer;
    let points = 0;
    let newStreak = currentStreak;

    // Encouraging messages pools
    const positiveMessages = [
      'آفرین! 👏',
      'عالی بود! ⭐',
      'درست گفتی! 🚀',
      'فوق‌العاده‌ای! 🌟',
      'هورا! درست شد! 🎉',
      'هوشمندانه بود! 💡',
      'ماشالله قهرمان! ✨',
    ];

    const learningMessages = [
      'اشکالی نداره! این ضرب رو با هم یاد می‌گیریم 🌱',
      'تلاش خیلی خوبی بود! دفعه بعد حتماً موفق می‌شی 💪',
      'تمرین بیشتر یعنی مهارت بیشتر! 💡',
      'با همدیگه دوباره تمرینش می‌کنیم ⭐',
    ];

    if (isCorrect) {
      points += 10; // Base score (Always positive, never deducted)
      if (answerTimeSeconds < 3.5) {
        points += 5; // Speed bonus
      }

      newStreak += 1;
      let feedbackMsg = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];

      if (newStreak === 3) {
        feedbackMsg = `زنجیره ۳تایی! عالی پیش می‌ری! ⚡`;
        points += 10;
        if (soundEnabled) sounds.playStreakSound();
      } else if (newStreak === 5) {
        feedbackMsg = `زنجیره ۵تایی طلایی! شگفت‌انگیزی! 🌟🔥`;
        points += 25;
        if (soundEnabled) sounds.playStreakSound();
      } else if (newStreak === 7) {
        feedbackMsg = `زنجیره ۷تایی رویایی! نابغه‌ای! 🚀✨`;
        points += 35;
        if (soundEnabled) sounds.playStreakSound();
      } else if (newStreak === 10) {
        feedbackMsg = `زنجیره ۱۰تایی کامل! تو قهرمان واقعی ضربی! 👑🎉`;
        points += 60;
        if (soundEnabled) sounds.playStreakSound();
      } else if (newStreak > 1) {
        feedbackMsg = `${positiveMessages[Math.floor(Math.random() * positiveMessages.length)]} (زنجیره ${toPersianDigits(newStreak)} 🔥)`;
        if (soundEnabled) sounds.playCorrectSound();
      } else {
        if (soundEnabled) sounds.playCorrectSound();
      }

      setCorrectCount((prev) => prev + 1);
      setCurrentStreak(newStreak);
      if (newStreak > maxStreakInSession) {
        setMaxStreakInSession(newStreak);
      }

      setFeedback({
        isCorrect: true,
        message: feedbackMsg,
        pointsEarned: points,
      });

      // Launch small celebratory confetti burst for correct answer
      confetti({
        particleCount: newStreak >= 3 ? 40 : 25,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#34d399', '#fbbf24', '#f472b6', '#38bdf8'],
      });

    } else {
      newStreak = 0;
      setCurrentStreak(0);
      setWrongCount((prev) => prev + 1);
      if (soundEnabled) sounds.playWrongSound();

      const supportiveMsg = learningMessages[Math.floor(Math.random() * learningMessages.length)];

      setFeedback({
        isCorrect: false,
        message: supportiveMsg,
        pointsEarned: 0,
      });
    }

    setSessionScore((prev) => prev + points);

    // Update global user stats in real-time
    const updatedUserStats = recordQuestionResult(
      stats,
      currentQuestion.factor1,
      currentQuestion.factor2,
      isCorrect
    );
    onUpdateStats(updatedUserStats);
  };

  // Next question or end practice
  const handleNextQuestion = () => {
    if (!level) return;

    if (questionIndex + 1 >= 10) {
      // Practice Complete!
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const totalCorrect = correctCount + (feedback?.isCorrect ? 1 : 0); // account for last question
      const score = sessionScore;

      let stars = 1;
      let msg = 'تمرین بیشتری کن تا عالی‌تر بشی! 💪';
      if (totalCorrect >= 9) {
        stars = 3;
        msg = 'فوق‌العاده بودی! تو یک نابغه ضرب هستی! 🌟🎉';
      } else if (totalCorrect >= 6) {
        stars = 2;
        msg = 'عالی پیش رفتی! آفرین به تلاش خوبت 👏⭐';
      }

      const finalSummary: PracticeSummary = {
        scoreEarned: score,
        correctCount: totalCorrect,
        wrongCount: 10 - totalCorrect,
        totalTimeSeconds: totalTime,
        maxStreakInSession: Math.max(maxStreakInSession, currentStreak),
        stars,
        message: msg,
      };

      setSummary(finalSummary);

      if (soundEnabled) {
        sounds.playLevelComplete();
      }

      // Grand celebration confetti
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });

      // Update user stats with practice completion
      let newStats: UserStats = {
        ...stats,
        totalScore: stats.totalScore + score,
        highScore: Math.max(stats.highScore, stats.totalScore + score),
        maxStreak: Math.max(stats.maxStreak, Math.max(maxStreakInSession, currentStreak)),
        totalPractices: stats.totalPractices + 1,
      };

      newStats = checkBadges(newStats);
      saveUserStats(newStats);
      onUpdateStats(newStats);

    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      const nextQ = generateQuestion(level, stats);
      setCurrentQuestion(nextQ);
      setQuestionStartTime(Date.now());
      setIsAnswered(false);
      setSelectedOption(null);
      setFeedback(null);
    }
  };

  // Level Selection Screen
  if (!level) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 text-slate-900 shadow-lg border-4 border-amber-300 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="bg-white/90 text-amber-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
              تمرین ۱۰ سؤالی
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              سطح تمرینت رو انتخاب کن! 🎯
            </h2>
            <p className="text-sm font-medium text-slate-900 opacity-90 leading-relaxed">
              با پاسخ به ۱۰ سؤال، امتیاز بگیر و زنجیره پاسخ‌های صحیح رو برای جایزه ویژه بساز!
            </p>
          </div>
          <Sparkles className="absolute left-3 bottom-3 w-24 h-24 text-amber-200/30 -rotate-12 pointer-events-none" />
        </div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Easy Level */}
          <button
            onClick={() => startPractice('easy')}
            className="group relative bg-emerald-50 hover:bg-emerald-100/80 border-3 border-emerald-400 rounded-2xl p-5 text-right flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <h3 className="text-lg font-black text-emerald-900">سطح آسان (جدول ۱ تا ۵)</h3>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                مناسب برای شروع و یادگیری پایههای ضرب
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow group-hover:scale-110 transition-transform">
              ←
            </div>
          </button>

          {/* Medium Level */}
          <button
            onClick={() => startPractice('medium')}
            className="group relative bg-sky-50 hover:bg-sky-100/80 border-3 border-sky-400 rounded-2xl p-5 text-right flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <h3 className="text-lg font-black text-sky-900">سطح متوسط (جدول ۱ تا ۷)</h3>
              </div>
              <p className="text-xs text-sky-700 font-medium">
                برای تمرین بیشتر و افزایش سرعت محاسبه
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow group-hover:scale-110 transition-transform">
              ←
            </div>
          </button>

          {/* Hard Level */}
          <button
            onClick={() => startPractice('hard')}
            className="group relative bg-purple-50 hover:bg-purple-100/80 border-3 border-purple-400 rounded-2xl p-5 text-right flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-black text-purple-900">سطح سخت (جدول ۱ تا ۱۰)</h3>
              </div>
              <p className="text-xs text-purple-700 font-medium">
                چالش کامل جدول ضرب برای قهرمانان
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-lg shadow group-hover:scale-110 transition-transform">
              ←
            </div>
          </button>

          {/* Weakness Practice if available */}
          {weaknesses.length > 0 && (
            <button
              onClick={() => startPractice('weaknesses')}
              className="group relative bg-rose-50 hover:bg-rose-100 border-3 border-rose-400 rounded-2xl p-5 text-right flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-rose-600 animate-pulse" />
                  <h3 className="text-lg font-black text-rose-900">تمرین روی ضعف‌های من</h3>
                </div>
                <p className="text-xs text-rose-700 font-medium">
                  تمرکز روی ضرب‌هایی که بیشتر نیاز به تمرین داری
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow group-hover:scale-110 transition-transform">
                ←
              </div>
            </button>
          )}

        </div>

        {/* Quick Shortcut to Learn Page */}
        <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <p className="text-xs font-bold text-amber-900">هنوز آماده تمرین نیستی؟</p>
              <p className="text-[11px] text-amber-800">جدول ضرب رو ابتدا کلا مرور و یاد بگیر.</p>
            </div>
          </div>
          <button
            onClick={onNavigateToLearn}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer transition-colors"
          >
            یادگیری
          </button>
        </div>

      </div>
    );
  }

  // Summary Screen when 10 questions are finished
  if (summary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-amber-300 space-y-6"
        >
          {/* Header & Stars */}
          <div className="space-y-3">
            <div className="flex justify-center pb-2">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression="celebration"
                size="lg"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{summary.message}</h2>
            
            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-10 h-10 transition-all ${
                    starIndex <= summary.stars
                      ? 'text-amber-400 fill-amber-400 drop-shadow'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">امتیاز کسب‌شده</p>
              <p className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                {toPersianDigits(summary.scoreEarned)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">پاسخ‌های صحیح</p>
              <p className="text-2xl font-black text-emerald-600">
                {toPersianDigits(summary.correctCount)} از ۱۰
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">پاسخ‌های غلط</p>
              <p className="text-2xl font-black text-rose-500">
                {toPersianDigits(summary.wrongCount)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">زمان صرف‌شده</p>
              <p className="text-xl font-black text-slate-700 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {formatTimePersian(summary.totalTimeSeconds)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startPractice(level)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3.5 px-4 rounded-2xl shadow-lg border-b-4 border-amber-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>تمرین مجدد</span>
            </button>

            <button
              onClick={() => setLevel(null)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>انتخاب سطح دیگر</span>
            </button>
          </div>

        </motion.div>
      </div>
    );
  }

  // Active Practice Question Screen
  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-5">
      
      {/* Top Practice Bar: Progress, Question Counter, Streak */}
      <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-amber-200 flex items-center justify-between">
        
        {/* Back Button */}
        <button
          onClick={() => setLevel(null)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-xl cursor-pointer"
        >
          انصراف
        </button>

        {/* Question Counter */}
        <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-xl text-amber-900 font-black text-sm">
          <span>سؤال</span>
          <span>{toPersianDigits(questionIndex + 1)}</span>
          <span>از ۱۰</span>
        </div>

        {/* Streak Indicator */}
        <div className="flex items-center gap-1 text-orange-600 font-black text-sm">
          <Flame className={`w-5 h-5 fill-orange-500 ${currentStreak > 0 ? 'animate-bounce' : 'opacity-40'}`} />
          <span>{toPersianDigits(currentStreak)}</span>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((questionIndex + 1) / 10) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 text-center shadow-xl border-4 border-amber-300 space-y-6 relative overflow-hidden"
      >
        {/* Dynamic Interactive Character Companion (Rule 2) */}
        <div className="flex justify-center -mt-2 pb-1">
          <GameCharacter
            characterId={(stats.avatar as any) || 'fox'}
            expression={
              isAnswered
                ? feedback?.isCorrect
                  ? currentStreak >= 3
                    ? 'celebration'
                    : 'correct'
                  : 'thinking'
                : selectedOption !== null
                ? 'thinking'
                : 'idle'
            }
            size="md"
          />
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          پاسخ صحیح را انتخاب کن
        </p>

        {/* Question Numbers Prompt */}
        <div className="py-4 bg-amber-50 rounded-2xl border-2 border-amber-200/80 shadow-inner flex justify-center items-center">
          <MathFormula
            factor1={currentQuestion?.factor1 ?? 1}
            factor2={currentQuestion?.factor2 ?? 1}
            answer="؟"
            className="text-slate-900 tracking-wider"
            symbolColor="text-amber-500"
            size="display"
          />
        </div>


        {/* Multiple Choice Options Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.answer;

            let btnStyle = 'bg-slate-50 hover:bg-amber-100 text-slate-900 border-slate-200 shadow';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-102';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`py-4 px-4 rounded-2xl typo-math-large border-b-4 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{toPersianDigits(option)}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Message Banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl border-2 font-black text-base flex flex-col items-center justify-center gap-1 ${
                feedback.isCorrect
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-rose-100 border-rose-300 text-rose-900'
              }`}
            >
              <span>{feedback.message}</span>
              {!feedback.isCorrect && (
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  پاسخ صحیح:{' '}
                  <MathFormula
                    factor1={currentQuestion?.factor1 ?? 1}
                    factor2={currentQuestion?.factor2 ?? 1}
                    answer={currentQuestion?.answer ?? 0}
                    className="font-black text-rose-900"
                  />
                </span>
              )}

              {feedback.pointsEarned > 0 && (
                <span className="text-xs bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full mt-1">
                  +{toPersianDigits(feedback.pointsEarned)} امتیاز 🎉
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Question Button */}
        {isAnswered && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={handleNextQuestion}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-4 px-6 rounded-2xl shadow-lg border-b-4 border-amber-600 text-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            <span>{questionIndex + 1 === 10 ? 'مشاهده نتیجه' : 'سؤال بعدی'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}

      </motion.div>

    </div>
  );
};
