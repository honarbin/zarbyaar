import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers,
  Award,
  Grid,
  Check,
  Zap,
  BookOpen,
  Lightbulb,
  ChevronLeft
} from 'lucide-react';
import { toPersianDigits, sounds } from '../utils/persian';
import { getSmartRecommendation } from '../utils/storage';
import { MathFormula } from './MathFormula';
import { MathExpression } from './MathExpression';
import { GameCharacter } from './GameCharacter';
import { UserStats } from '../types';

interface ConceptViewProps {
  stats: UserStats;
  onStartTablePractice: (tableNum: number) => void;
  onNavigateToPractice: () => void;
}

type ConceptSubTab = 'lessons' | 'make-groups' | 'add-or-multiply' | 'pre-table';

// Sample items for Make Groups game
const GAME_ITEMS = [
  { id: 'apple', emoji: '🍎', label: 'سیب' },
  { id: 'donut', emoji: '🍩', label: 'دونات' },
  { id: 'star', emoji: '⭐', label: 'ستاره' },
  { id: 'candy', emoji: '🍬', label: 'شکلات' },
  { id: 'duck', emoji: '🦆', label: 'اردک' },
];

export const ConceptView: React.FC<ConceptViewProps> = ({
  stats,
  onStartTablePractice,
  onNavigateToPractice,
}) => {
  const [activeTab, setActiveTab] = useState<ConceptSubTab>('lessons');

  const recommendation = getSmartRecommendation(stats);

  const handleRecommendationClick = () => {
    if (recommendation.tableTarget) {
      onStartTablePractice(recommendation.tableTarget);
    } else {
      onNavigateToPractice();
    }
  };

  // --- Sub-Tab 1 State: Lessons & Commutativity Toggle ---
  const [commutativityOrder, setCommutativityOrder] = useState<'3x4' | '4x3'>('3x4');
  const [selectedStep, setSelectedStep] = useState<number>(1);

  // --- Sub-Tab 2 State: Make Groups Game ---
  const [makeGroupIndex, setMakeGroupIndex] = useState<number>(0);
  const gameChallenges = [
    { groups: 3, itemsPerGroup: 4, emoji: '🍎', name: 'سیب' },
    { groups: 4, itemsPerGroup: 3, emoji: '🍩', name: 'دونات' },
    { groups: 2, itemsPerGroup: 5, emoji: '⭐', name: 'ستاره' },
    { groups: 5, itemsPerGroup: 2, emoji: '🍬', name: 'شکلات' },
    { groups: 3, itemsPerGroup: 3, emoji: '🦆', name: 'اردک' },
  ];
  const currentChallenge = gameChallenges[makeGroupIndex % gameChallenges.length];

  // Plate contents for the current challenge
  const [plateCounts, setPlateCounts] = useState<number[]>([0, 0, 0, 0, 0]);
  const [groupGameStep, setGroupGameStep] = useState<'build' | 'sum' | 'mult' | 'done'>('build');
  const [userSumAnswer, setUserSumAnswer] = useState<string>('');
  const [userMultAnswer, setUserMultAnswer] = useState<string>('');
  const [groupFeedback, setGroupFeedback] = useState<{ isCorrect: boolean; msg: React.ReactNode } | null>(null);

  // --- Sub-Tab 3 State: Add or Multiply Game ---
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const quizQuestions = [
    {
      additionStr: '۲ + ۲ + ۲ + ۲',
      addends: [2, 2, 2, 2],
      numGroups: 4,
      groupSize: 2,
      total: 8,
      correctOption: '4x2',
      explanation: '۴ بار عدد ۲ جمع شده است، یعنی ۴ گروه ۲‌تایی که معادل ۴ × ۲ است.',
    },
    {
      additionStr: '۵ + ۵ + ۵',
      addends: [5, 5, 5],
      numGroups: 3,
      groupSize: 5,
      total: 15,
      correctOption: '3x5',
      explanation: '۳ بار عدد ۵ جمع شده است، یعنی ۳ گروه ۵‌تایی که معادل ۳ × ۵ است.',
    },
    {
      additionStr: '۳ + ۳ + ۳ + ۳ + ۳',
      addends: [3, 3, 3, 3, 3],
      numGroups: 5,
      groupSize: 3,
      total: 15,
      correctOption: '5x3',
      explanation: '۵ بار عدد ۳ جمع شده است، یعنی ۵ گروه ۳‌تایی که معادل ۵ ضربدر ۳ است.',
    },
    {
      additionStr: '۴ + ۴',
      addends: [4, 4],
      numGroups: 2,
      groupSize: 4,
      total: 8,
      correctOption: '2x4',
      explanation: '۲ بار عدد ۴ جمع شده است، یعنی ۲ گروه ۴‌تایی که معادل ۲ ضربدر ۴ است.',
    },
  ];
  const currentQuiz = quizQuestions[quizIndex % quizQuestions.length];
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // --- Sub-Tab 4 State: Pre-table Lessons ---
  const [preTableNum, setPreTableNum] = useState<number>(4);

  // Handle building item addition
  const handleAddItemToPlate = (plateIdx: number) => {
    const updated = [...plateCounts];
    if (updated[plateIdx] < 10) {
      updated[plateIdx] += 1;
      setPlateCounts(updated);
    }
  };

  const handleRemoveItemFromPlate = (plateIdx: number) => {
    const updated = [...plateCounts];
    if (updated[plateIdx] > 0) {
      updated[plateIdx] -= 1;
      setPlateCounts(updated);
    }
  };

  const handleVerifyGroupBuilding = () => {
    const targetGroups = currentChallenge.groups;
    const targetItems = currentChallenge.itemsPerGroup;

    let isCorrect = true;
    for (let i = 0; i < targetGroups; i++) {
      if (plateCounts[i] !== targetItems) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      sounds.playCorrectSound();
      setGroupFeedback({
        isCorrect: true,
        msg: `عالی بود! شما دقیقاً ${toPersianDigits(targetGroups)} گروه ${toPersianDigits(targetItems)}‌تایی ساختید.`,
      });
      setGroupGameStep('sum');
    } else {
      sounds.playWrongSound();
      setGroupFeedback({
        isCorrect: false,
        msg: `هنوز درست نیست! باید در هر کدام از ${toPersianDigits(targetGroups)} بشقاب، دقیقاً ${toPersianDigits(targetItems)} تا قرار بدهید.`,
      });
    }
  };

  const handleVerifySum = () => {
    const targetTotal = currentChallenge.groups * currentChallenge.itemsPerGroup;
    if (parseInt(userSumAnswer, 10) === targetTotal) {
      sounds.playCorrectSound();
      setGroupFeedback({
        isCorrect: true,
        msg: 'آفرین! مجموع همگی درست است.',
      });
      setGroupGameStep('mult');
    } else {
      sounds.playWrongSound();
      setGroupFeedback({
        isCorrect: false,
        msg: `دوباره بشمار! حاصل مجموع می‌شود ${toPersianDigits(targetTotal)}.`,
      });
    }
  };

  const handleVerifyMult = () => {
    const targetTotal = currentChallenge.groups * currentChallenge.itemsPerGroup;
    if (parseInt(userMultAnswer, 10) === targetTotal) {
      sounds.playStreakSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setGroupFeedback({
        isCorrect: true,
        msg: (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-black text-emerald-950">فوق‌العاده بود! 🎉</span>
            <div className="flex flex-row items-center justify-center gap-2 bg-white px-3 py-1 rounded-xl border border-emerald-300 font-black text-emerald-900" dir="ltr" style={{ direction: 'ltr' }}>
              <span>{toPersianDigits(currentChallenge.groups)}</span>
              <span className="text-emerald-500 mx-1 font-black text-lg">×</span>
              <span>{toPersianDigits(currentChallenge.itemsPerGroup)}</span>
              <span className="text-slate-400 mx-1">=</span>
              <span className="text-emerald-600">{toPersianDigits(targetTotal)}</span>
            </div>
          </div>
        ),
      });
      setGroupGameStep('done');
    } else {
      sounds.playWrongSound();
      setGroupFeedback({
        isCorrect: false,
        msg: (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-black text-rose-950">دوباره بررسی کن! 🔍</span>
            <div className="flex flex-row items-center justify-center flex-wrap gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-300 font-black text-rose-900" dir="ltr" style={{ direction: 'ltr' }}>
              <span>حاصل</span>
              <span className="bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-200 flex flex-row items-center gap-1 mx-1" dir="ltr" style={{ direction: 'ltr' }}>
                <span>{toPersianDigits(currentChallenge.groups)}</span>
                <span className="text-rose-500 mx-1 font-black text-lg">×</span>
                <span>{toPersianDigits(currentChallenge.itemsPerGroup)}</span>
              </span>
              <span>می‌شود</span>
              <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-lg border border-emerald-200 mx-1">{toPersianDigits(targetTotal)}</span>
            </div>
          </div>
        ),
      });
    }
  };

  const resetMakeGroupGame = () => {
    setMakeGroupIndex((prev) => prev + 1);
    setPlateCounts([0, 0, 0, 0, 0]);
    setGroupGameStep('build');
    setUserSumAnswer('');
    setUserMultAnswer('');
    setGroupFeedback(null);
  };

  const handleQuizAnswer = (opt: string) => {
    setSelectedQuizOption(opt);
    const isCorrect = opt === currentQuiz.correctOption;
    if (isCorrect) {
      sounds.playCorrectSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setQuizFeedback({
        isCorrect: true,
        text: `کاملاً درست است! 🎉 ${currentQuiz.explanation}`,
      });
    } else {
      sounds.playWrongSound();
      setQuizFeedback({
        isCorrect: false,
        text: `دقت کن! ${currentQuiz.explanation}`,
      });
    }
  };

  const nextQuizQuestion = () => {
    setQuizIndex((prev) => prev + 1);
    setSelectedQuizOption(null);
    setQuizFeedback(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      
      {/* 🚀 Welcome Hero Sticker Banner (Rule 9) */}
      <div className="bg-white rounded-3xl p-4 border-2 border-amber-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-amber-50 rounded-2xl p-1 border border-amber-100">
          <GameCharacter
            characterId={(stats.avatar as any) || 'fox'}
            expression="idle"
            size="sm"
          />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-slate-800 typo-body">
            سلام {stats.username} قهرمان! 👋
          </h2>
          <p className="text-[11px] text-slate-500 font-bold leading-relaxed typo-body-small">
            امروز آماده‌ای یک مرحله دیگه جلو بری و جدول ضرب رو مثل آب خوردن یاد بگیری؟ 🚀
          </p>
        </div>
      </div>

      {/* 💡 Smart Daily Practice Recommendation (Rule 6) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-amber-300/80 rounded-3xl p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
          <div className="space-y-1.5 text-right flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                {recommendation.badgeText}
              </span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300" />
                <span>پیشنهاد تمرین امروز (بر اساس یادگیری تو)</span>
              </span>
            </div>
            <h4 className="font-black text-sm text-slate-900 pt-0.5">
              {recommendation.title}
            </h4>
            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
              {recommendation.description}
            </p>
          </div>

          <button
            onClick={handleRecommendationClick}
            className="w-full sm:w-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{recommendation.actionLabel}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-900 rounded-3xl p-5 shadow-lg border-4 border-amber-300 relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            پایه و درک عمیق ریاضی
          </span>
          <span className="text-2xl">🍎✨</span>
        </div>

        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          آموزش مفهوم ضرب (جمع تکراری)
        </h1>
        <p className="text-xs text-amber-950 font-bold leading-relaxed">
          قبل از حفظ کردن جدول ضرب، یاد بگیر که ضرب اصلاً از کجا آمده و چگونه ساخته می‌شود!
        </p>
      </div>

      {/* Main Sub-tabs Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center justify-between gap-1 text-xs font-black overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>💡</span>
          <span>مفهوم ضرب</span>
        </button>

        <button
          onClick={() => setActiveTab('make-groups')}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'make-groups'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎮</span>
          <span>گروه‌ها را بساز</span>
        </button>

        <button
          onClick={() => setActiveTab('add-or-multiply')}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'add-or-multiply'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🧩</span>
          <span>جمع یا ضرب؟</span>
        </button>

        <button
          onClick={() => setActiveTab('pre-table')}
          className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'pre-table'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📖</span>
          <span>درس جدول‌ها</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: CONCEPT LESSONS & REPEATED ADDITION */}
      {/* ========================================================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          
          {/* Card 1: Main Concept (3 x 4 Example) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  ۱
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  ضرب همان «جمع تکراری» است!
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-bold">
              وقتی با عبارت <strong className="text-amber-700 text-sm">۳ × ۴</strong> مواجه می‌شویم، یعنی:
              <br />
              «۳ گروه داریم و در هر گروه ۴ تاست.»
            </p>

            {/* Visual Apple Groups */}
            <div className="bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
              <div className="text-xs font-black text-slate-800 text-center">
                نمایش تصویری گروه‌بندی:
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3].map((g) => (
                  <div key={g} className="bg-white p-3 rounded-2xl border-2 border-amber-300 shadow-sm text-center space-y-1.5">
                    <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                      گروه {toPersianDigits(g)}
                    </span>
                    <div className="flex justify-center flex-wrap gap-1 text-lg">
                      🍎 🍎 🍎 🍎
                    </div>
                    <span className="text-xs font-black text-slate-600">۴ تا</span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-3 rounded-2xl border border-amber-200 text-center font-black text-amber-900 text-sm shadow-xs">
                ۳ گروه ۴‌تایی = {toPersianDigits(12)}
              </div>
            </div>

            {/* Addition to Multiplication Transformation */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-3xl text-slate-950 font-black text-center space-y-4 shadow-sm">
              <div className="text-sm text-slate-900 typo-h3">ضرب یعنی جمع تکراری!</div>
              <div className="text-xs text-slate-800 typo-body bg-amber-100/60 inline-block px-3 py-1 rounded-full">۳ گروه ۴تایی داریم.</div>
              
              <div className="flex flex-col items-center gap-3 bg-white/95 p-4 rounded-2xl shadow-inner">
                <div className="text-xs text-slate-500 typo-caption">جمع تکراری</div>
                <MathExpression expression="4 + 4 + 4 = 12" size="large" color="text-amber-950" symbolColor="text-amber-500" />
                
                <div className="text-xl text-amber-600 font-bold">↓</div>
                
                <div className="text-xs text-slate-500 typo-caption">عبارت ضرب</div>
                <MathExpression expression="3 × 4 = 12" size="large" color="text-slate-950" symbolColor="text-amber-600" />
              </div>

              {/* Character speech bubble (Rule 8) */}
              <div className="bg-amber-50/90 p-3 rounded-2xl border border-amber-200/80 flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl p-1 shrink-0">
                  <GameCharacter
                    characterId={(stats.avatar as any) || 'fox'}
                    expression="cheering"
                    size="sm"
                  />
                </div>
                <div className="text-[11px] text-slate-800 font-extrabold text-right leading-relaxed">
                  «دیدی؟ ضرب کمک میکنه جمع‌های تکراری رو خیلی سریع‌تر و راحت‌تر بنویسیم!» 🚀✨
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Equal Groups Example (Plates & Apples Story) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  ۲
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  آموزش «گروه‌های مساوی»
                </h3>
              </div>
            </div>

            <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200 text-xs font-bold text-slate-800 leading-relaxed">
              مثال واقعی: «اگر <strong className="text-sky-700">۴ بشقاب</strong> داشته باشیم و داخل هر بشقاب <strong className="text-sky-700">۳ سیب</strong> باشد، چند سیب داریم؟»
            </div>

            {/* 4 Plates Representation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((p) => (
                <div key={p} className="bg-sky-100/80 p-3 rounded-2xl border-2 border-sky-300 text-center space-y-1">
                  <span className="text-[10px] font-black text-sky-900 bg-white px-2 py-0.5 rounded-full">
                    بشقاب {toPersianDigits(p)}
                  </span>
                  <div className="text-lg py-1">🍎 🍎 🍎</div>
                  <span className="text-xs font-black text-slate-700">۳ سیب</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl text-center shadow-lg">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-sky-400 font-semibold typo-caption">جمع تکراری</span>
                <MathExpression expression="3 + 3 + 3 + 3 = 12" size="large" color="text-sky-200" symbolColor="text-sky-400" />
              </div>
              <div className="w-full border-t border-slate-800 my-1"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-amber-400 font-semibold typo-caption">عبارت ضرب</span>
                <MathExpression expression="4 × 3 = 12" size="large" color="text-amber-300" symbolColor="text-amber-400" />
              </div>
            </div>
          </div>

          {/* Card 3: Order of Multiplication & Commutativity */}
          <div className="bg-white rounded-3xl p-5 border-2 border-purple-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  ۳
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  نکته مهم: ترتیب ضرب و جابه‌جایی
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-bold">
              هر دو ضرب حاصلشان <strong className="text-purple-700">۱۲</strong> است، اما چیدمان و معنی گروه‌های آن‌ها با هم متفاوت است!
            </p>

            {/* Interactive Commutativity Switcher */}
            <div className="flex justify-center gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-200">
              <button
                onClick={() => setCommutativityOrder('3x4')}
                className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  commutativityOrder === '3x4'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-900 hover:bg-purple-100'
                }`}
              >
                <span className="dir-ltr inline-block">۳ × ۴</span> (۳ گروه ۴تایی)
              </button>
              <button
                onClick={() => setCommutativityOrder('4x3')}
                className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  commutativityOrder === '4x3'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-900 hover:bg-purple-100'
                }`}
              >
                <span className="dir-ltr inline-block">۴ × ۳</span> (۴ گروه ۳تایی)
              </button>
            </div>

            {/* Visualizer for active commutativity view */}
            <AnimatePresence mode="wait">
              <motion.div
                key={commutativityOrder}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-purple-100/80 p-4 rounded-2xl border-2 border-purple-300 text-center space-y-3"
              >
                {commutativityOrder === '3x4' ? (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-purple-950 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-xs">
                      ۳ گروه ۴‌تایی
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((g) => (
                        <div key={g} className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-xs">
                          <div className="text-sm">🍎🍎🍎🍎</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 bg-white rounded-2xl border border-purple-200 shadow-xs">
                      <MathExpression expression="4 + 4 + 4 = 12" size="normal" color="text-purple-950" symbolColor="text-purple-400" />
                      <span className="text-purple-500 font-bold">→</span>
                      <MathExpression expression="3 × 4 = 12" size="normal" color="text-purple-900" symbolColor="text-purple-600" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-purple-950 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-xs">
                      ۴ گروه ۳‌تایی
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((g) => (
                        <div key={g} className="bg-white p-2 rounded-xl border border-purple-200 shadow-xs">
                          <div className="text-xs">🍎🍎🍎</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 bg-white rounded-2xl border border-purple-200 shadow-xs">
                      <MathExpression expression="3 + 3 + 3 + 3 = 12" size="normal" color="text-purple-950" symbolColor="text-purple-400" />
                      <span className="text-purple-500 font-bold">→</span>
                      <MathExpression expression="4 × 3 = 12" size="normal" color="text-purple-900" symbolColor="text-purple-600" />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card 4: 6-Step Learning Stepper (آموزش مرحله‌ای) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  ۴
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  مسیر ۶ مرحله‌ای یادگیری ضرب
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              روی هر مرحله کلیک کن تا نقشه راه یادگیری ضرب را ببینی:
            </p>

            {/* 6 Step Interactive Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { step: 1, title: '۱. شمردن اشیا', desc: 'شمردن واقعی سیب‌ها و شکلات‌ها' },
                { step: 2, title: '۲. ساخت گروه', desc: 'دسته‌بندی در بشقاب‌های مساوی' },
                { step: 3, title: '۳. جمع تکراری', desc: 'نوشتن جمع‌های متوالی مثل ۴+۴+۴' },
                { step: 4, title: '۴. نوشتن ضرب', desc: 'تبدیل جمع تکراری به عبارت ضرب' },
                { step: 5, title: '۵. حل ذهنی', desc: 'محاسبه بدون نیاز به شکل و تصویر' },
                { step: 6, title: '۶. جدول و سرعت', desc: 'ورود به جدول ضرب و تمرینات سرعتی' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setSelectedStep(s.step)}
                  className={`p-3 rounded-2xl text-right transition-all cursor-pointer border-2 ${
                    selectedStep === s.step
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
                      : 'bg-emerald-50/60 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <div className="text-xs font-black">{s.title}</div>
                  <div className="text-[10px] opacity-90 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Active Step Details */}
            <div className="bg-emerald-100/80 p-4 rounded-2xl border border-emerald-300 space-y-2">
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>
                  مرحله {toPersianDigits(selectedStep)} از ۶:{' '}
                  {
                    [
                      'شمردن اشیای واقعی در محیط اطراف',
                      'ساختن گروه‌های کاملاً مساوی',
                      'تمرین جمع تکراری اعداد یکسان',
                      'نوشتن علامت ضرب (×) و عبارت ریاضی',
                      'حل ضرب با تصویرسازی در ذهن',
                      'ورود به جدول ضرب و افزایش سرعت',
                    ][selectedStep - 1]
                  }
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-bold">
                {
                  [
                    'در این مرحله کودک با شمردن تک‌تک سیب‌ها، گردوها یا اسباب‌بازی‌ها یاد می‌گیرد که تعداد کُلی از مجموع اشیا به دست می‌آید.',
                    'کودک اشیا را درون بشقاب‌ها یا گروه‌های برابر تقسیم می‌کند تا مفهوم «تعداد گروه‌ها» را ملموس لمس کند.',
                    'کودک به‌جای شمردن تک‌تک، جمع‌های تکراری مثل ۵ + ۵ + ۵ را انجام می‌دهد.',
                    'کودک علامت × را یاد می‌گیرد و می‌فهمد ۳ ضربدر ۵ یعنی ۳ گروه ۵‌تایی.',
                    'تصاویر حذف می‌شوند و کودک با تجسم گروه‌ها پاسخ را در ذهن محاسبه می‌کند.',
                    'با تمرین‌های جذاب و سرعتی، جدول ضرب به حافظه بلندمدت منتقل می‌شود.',
                  ][selectedStep - 1]
                }
              </p>
            </div>

            {/* Bottom CTA */}
            <button
              onClick={() => setActiveTab('make-groups')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl shadow-md border-b-4 border-amber-600 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>ورود به بازی تعاملی «گروه‌ها را بساز»</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: MAKE GROUPS GAME (بازی «گروه‌ها را بساز») */}
      {/* ========================================================= */}
      {activeTab === 'make-groups' && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-lg space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
            <div>
              <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                چالش شماره {toPersianDigits(makeGroupIndex + 1)}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                بازی «گروه‌ها را بساز» 🍽️
              </h2>
            </div>

            <button
              onClick={resetMakeGroupGame}
              className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>سوال بعدی</span>
            </button>
          </div>

          {/* System Instruction Prompt */}
          <div className="bg-amber-100/90 p-4 rounded-2xl border-2 border-amber-300 text-center space-y-1">
            <div className="text-xs font-bold text-amber-950">دستور سیستم:</div>
            <div className="text-xl font-black text-amber-900">
              «{toPersianDigits(currentChallenge.groups)} گروه {toPersianDigits(currentChallenge.itemsPerGroup)}‌تایی از {currentChallenge.name} بساز!»
            </div>
          </div>

          {/* Plates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: currentChallenge.groups }).map((_, pIdx) => {
              const currentCount = plateCounts[pIdx];
              const isFull = currentCount === currentChallenge.itemsPerGroup;

              return (
                <div
                  key={pIdx}
                  className={`p-3.5 rounded-2xl border-2 text-center space-y-2 transition-all ${
                    isFull
                      ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      بشقاب {toPersianDigits(pIdx + 1)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFull ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {toPersianDigits(currentCount)} از {toPersianDigits(currentChallenge.itemsPerGroup)}
                    </span>
                  </div>

                  {/* Visual Items Container */}
                  <div className="min-h-16 bg-white rounded-xl border border-amber-100 p-2 flex items-center justify-center flex-wrap gap-1 text-2xl shadow-inner">
                    {currentCount === 0 ? (
                      <span className="text-xs text-slate-400 font-medium">بشقاب خالی است</span>
                    ) : (
                      Array.from({ length: currentCount }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {currentChallenge.emoji}
                        </motion.span>
                      ))
                    )}
                  </div>

                  {/* Controls to add/remove items */}
                  {groupGameStep === 'build' && (
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddItemToPlate(pIdx)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        + اضافه
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromPlate(pIdx)}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        - کم
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback Area */}
          {groupFeedback && (
            <div
              className={`p-3.5 rounded-2xl border-2 text-xs font-black text-center ${
                groupFeedback.isCorrect
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                  : 'bg-rose-100 border-rose-400 text-rose-950'
              }`}
            >
              {groupFeedback.msg}
            </div>
          )}

          {/* STEP 1: VERIFY BUILDING GROUPS */}
          {groupGameStep === 'build' && (
            <button
              onClick={handleVerifyGroupBuilding}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-md border-b-4 border-amber-600 text-sm cursor-pointer"
            >
              تایید گروه‌ها و ادامه
            </button>
          )}

          {/* STEP 2: REPEATED ADDITION QUESTION */}
          {groupGameStep === 'sum' && (
            <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-300 space-y-3 text-center">
              <div className="text-xs font-black text-sky-950">
                سوال سیستم: مجموع کل {currentChallenge.name}‌ها چند تا شد؟
              </div>

              <div className="text-lg font-black text-slate-800">
                {Array.from({ length: currentChallenge.groups })
                  .map(() => toPersianDigits(currentChallenge.itemsPerGroup))
                  .join(' + ')}{' '}
                = ?
              </div>

              <div className="flex justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="number"
                  value={userSumAnswer}
                  onChange={(e) => setUserSumAnswer(e.target.value)}
                  placeholder="عدد حاصل..."
                  className="w-28 text-center py-2 px-3 rounded-xl border-2 border-sky-400 text-slate-900 font-black text-base outline-none bg-white"
                />
                <button
                  onClick={handleVerifySum}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  تایید جمع
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MULTIPLICATION FORMULA QUESTION */}
          {groupGameStep === 'mult' && (
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 space-y-3 text-center">
              <div className="text-xs font-black text-purple-950">
                حالا عبارت ضرب آن را بنویس:
              </div>

              <div className="text-xl font-black text-purple-900 flex justify-center">
                <MathFormula
                  factor1={currentChallenge.groups}
                  factor2={currentChallenge.itemsPerGroup}
                  answer="؟"
                  className="text-purple-900"
                />
              </div>


              <div className="flex justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="number"
                  value={userMultAnswer}
                  onChange={(e) => setUserMultAnswer(e.target.value)}
                  placeholder="حاصل ضرب..."
                  className="w-28 text-center py-2 px-3 rounded-xl border-2 border-purple-400 text-slate-900 font-black text-base outline-none bg-white"
                />
                <button
                  onClick={handleVerifyMult}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  ثبت ضرب
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHALLENGE DONE */}
          {groupGameStep === 'done' && (
            <button
              onClick={resetMakeGroupGame}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-md border-b-4 border-emerald-700 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>آفرین! رفتن به چالش بعدی 🚀</span>
            </button>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ADDITION OR MULTIPLICATION GAME (بازی «جمع یا ضرب؟») */}
      {/* ========================================================= */}
      {activeTab === 'add-or-multiply' && (
        <div className="bg-white rounded-3xl p-5 border-2 border-sky-300 shadow-lg space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3">
            <div>
              <span className="text-[11px] font-black bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full">
                تست مفهومی {toPersianDigits(quizIndex + 1)} از ۴
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                بازی «جمع یا ضرب؟» 🧩
              </h2>
            </div>

            <button
              onClick={nextQuizQuestion}
              className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>سوال بعدی</span>
            </button>
          </div>

          {/* Addition Expression Box */}
          <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white p-5 rounded-2xl text-center space-y-2 shadow-md">
            <div className="text-xs font-bold text-sky-100">جمع تکراری مقابل را ببین:</div>
            <div className="text-3xl font-black text-white dir-ltr">
              {toPersianDigits(currentQuiz.additionStr)} = {toPersianDigits(currentQuiz.total)}
            </div>
            <div className="text-xs font-extrabold text-sky-100">
              کدام عبارت ضرب معادل دقیق این جمع تکراری است؟
            </div>
          </div>

          {/* Visual Group Representation */}
          <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 space-y-2">
            <div className="text-xs font-black text-slate-700 text-center">
              نمایش تصویری جمع: {toPersianDigits(currentQuiz.numGroups)} گروه {toPersianDigits(currentQuiz.groupSize)}‌تایی
            </div>
            <div className="flex justify-center flex-wrap gap-2">
              {Array.from({ length: currentQuiz.numGroups }).map((_, g) => (
                <div key={g} className="bg-white px-3 py-2 rounded-xl border border-sky-300 text-center font-bold text-xs shadow-xs">
                  🍏 × {toPersianDigits(currentQuiz.groupSize)}
                </div>
              ))}
            </div>
          </div>

          {/* Options A and B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleQuizAnswer(`${currentQuiz.numGroups}x${currentQuiz.groupSize}`)}
              disabled={selectedQuizOption !== null}
              className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer font-black ${
                selectedQuizOption === `${currentQuiz.numGroups}x${currentQuiz.groupSize}`
                  ? currentQuiz.correctOption === `${currentQuiz.numGroups}x${currentQuiz.groupSize}`
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                    : 'bg-rose-500 text-white border-rose-600 shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-xs text-slate-500 font-bold mb-1">گزینه الف)</div>
              <MathFormula factor1={currentQuiz.numGroups} factor2={currentQuiz.groupSize} className="text-xl font-black" />
              <div className="text-[11px] font-bold opacity-80 mt-1">
                ({toPersianDigits(currentQuiz.numGroups)} گروه {toPersianDigits(currentQuiz.groupSize)}‌تایی)
              </div>
            </button>

            <button
              onClick={() => handleQuizAnswer(`${currentQuiz.groupSize}x${currentQuiz.numGroups}`)}
              disabled={selectedQuizOption !== null}
              className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer font-black ${
                selectedQuizOption === `${currentQuiz.groupSize}x${currentQuiz.numGroups}`
                  ? currentQuiz.correctOption === `${currentQuiz.groupSize}x${currentQuiz.numGroups}`
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                    : 'bg-rose-500 text-white border-rose-600 shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-xs text-slate-500 font-bold mb-1">گزینه ب)</div>
              <MathFormula factor1={currentQuiz.groupSize} factor2={currentQuiz.numGroups} className="text-xl font-black" />
              <div className="text-[11px] font-bold opacity-80 mt-1">
                ({toPersianDigits(currentQuiz.groupSize)} گروه {toPersianDigits(currentQuiz.numGroups)}‌تایی)
              </div>

            </button>
          </div>

          {/* Feedback & Detailed Conceptual Explanation */}
          {quizFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border-2 text-xs font-bold leading-relaxed space-y-2 ${
                quizFeedback.isCorrect
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                  : 'bg-amber-100 border-amber-300 text-amber-950'
              }`}
            >
              <div>{quizFeedback.text}</div>

              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 text-slate-800 space-y-1">
                <div className="font-black text-slate-900">توضیح مفهومی:</div>
                <p>
                  هرچند حاصل ضرب هر دو گزینه برابر با {toPersianDigits(currentQuiz.total)} است، اما چیدمان تصویری {toPersianDigits(currentQuiz.numGroups)} گروه {toPersianDigits(currentQuiz.groupSize)}‌تایی مشخصاً برابر با عبارت <strong className="text-sky-700 font-black">{toPersianDigits(currentQuiz.numGroups)} × {toPersianDigits(currentQuiz.groupSize)}</strong> می‌باشد.
                </p>
              </div>

              <button
                onClick={nextQuizQuestion}
                className="w-full py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
              >
                سوال بعدی ←
              </button>
            </motion.div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: PRE-TABLE CONCEPTUAL LESSONS (درس مفهومی جدول‌ها) */}
      {/* ========================================================= */}
      {activeTab === 'pre-table' && (
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-300 shadow-lg space-y-5">
          
          <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
            <div>
              <span className="text-[11px] font-black bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full">
                درس مفهومی قبل از جدول
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                ساختار جمع تکراری جدول {toPersianDigits(preTableNum)} 📖
              </h2>
            </div>
          </div>

          {/* Table Selector 1 to 10 */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPreTableNum(n)}
                className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                  preTableNum === n
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                }`}
              >
                {toPersianDigits(n)}
              </button>
            ))}
          </div>

          {/* Conceptual Rows breakdown */}
          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 divide-y divide-purple-100">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((factor2) => {
              const repeatedAdd = Array.from({ length: factor2 })
                .map(() => toPersianDigits(preTableNum))
                .join(' + ');
              const product = preTableNum * factor2;

              return (
                <div key={factor2} className="py-2.5 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black flex items-center justify-center">
                      {toPersianDigits(factor2)}
                    </span>
                    <span className="text-purple-950 font-black flex items-center gap-1 dir-ltr">
                      <MathFormula factor1={preTableNum} factor2={factor2} />
                    </span>
                  </div>

                  <div className="text-slate-600 font-medium dir-ltr">
                    {repeatedAdd} = <strong className="text-emerald-600 font-black text-sm">{toPersianDigits(product)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button to practice this table directly */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => onStartTablePractice(preTableNum)}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-md border-b-4 border-amber-600 text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>تمرین تعاملی جدول {toPersianDigits(preTableNum)}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
