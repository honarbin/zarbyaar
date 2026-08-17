import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Lightbulb,
  Check,
  ArrowRight,
  ArrowLeft,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  CheckCheck
} from 'lucide-react';
import { UserStats } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';

interface SummaryViewProps {
  stats?: UserStats;
  onStartPractice?: () => void;
  onNavigateToLearn?: () => void;
}

// Model for a single multiplication card
export interface SummaryCard {
  id: string;
  f1: number;
  f2: number;
  product: number;
  isSquare: boolean;
}

// Model for a Deck
export interface DeckConfig {
  number: number;
  title: string;
  count: number;
  rangeText: string;
  color: {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    gradient: string;
    accent: string;
    shadow: string;
  };
  cards: SummaryCard[];
}

// Generate the 8 Decks strictly for 2..9
export const DECKS: DeckConfig[] = [
  {
    number: 2,
    title: 'ضرب‌های ۲',
    count: 8,
    rangeText: '۲×۲ تا ۲×۹',
    color: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      badgeBg: 'bg-rose-100 text-rose-800',
      badgeText: 'text-rose-700',
      gradient: 'from-rose-500 to-pink-500',
      accent: 'rose',
      shadow: 'shadow-rose-100',
    },
    cards: [
      { id: '2x2', f1: 2, f2: 2, product: 4, isSquare: true },
      { id: '2x3', f1: 2, f2: 3, product: 6, isSquare: false },
      { id: '2x4', f1: 2, f2: 4, product: 8, isSquare: false },
      { id: '2x5', f1: 2, f2: 5, product: 10, isSquare: false },
      { id: '2x6', f1: 2, f2: 6, product: 12, isSquare: false },
      { id: '2x7', f1: 2, f2: 7, product: 14, isSquare: false },
      { id: '2x8', f1: 2, f2: 8, product: 16, isSquare: false },
      { id: '2x9', f1: 2, f2: 9, product: 18, isSquare: false },
    ],
  },
  {
    number: 3,
    title: 'ضرب‌های ۳',
    count: 7,
    rangeText: '۳×۳ تا ۳×۹',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-900',
      badgeText: 'text-amber-700',
      gradient: 'from-amber-500 to-orange-500',
      accent: 'amber',
      shadow: 'shadow-amber-100',
    },
    cards: [
      { id: '3x3', f1: 3, f2: 3, product: 9, isSquare: true },
      { id: '3x4', f1: 3, f2: 4, product: 12, isSquare: false },
      { id: '3x5', f1: 3, f2: 5, product: 15, isSquare: false },
      { id: '3x6', f1: 3, f2: 6, product: 18, isSquare: false },
      { id: '3x7', f1: 3, f2: 7, product: 21, isSquare: false },
      { id: '3x8', f1: 3, f2: 8, product: 24, isSquare: false },
      { id: '3x9', f1: 3, f2: 9, product: 27, isSquare: false },
    ],
  },
  {
    number: 4,
    title: 'ضرب‌های ۴',
    count: 6,
    rangeText: '۴×۴ تا ۴×۹',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-900',
      badgeText: 'text-emerald-700',
      gradient: 'from-emerald-500 to-teal-500',
      accent: 'emerald',
      shadow: 'shadow-emerald-100',
    },
    cards: [
      { id: '4x4', f1: 4, f2: 4, product: 16, isSquare: true },
      { id: '4x5', f1: 4, f2: 5, product: 20, isSquare: false },
      { id: '4x6', f1: 4, f2: 6, product: 24, isSquare: false },
      { id: '4x7', f1: 4, f2: 7, product: 28, isSquare: false },
      { id: '4x8', f1: 4, f2: 8, product: 32, isSquare: false },
      { id: '4x9', f1: 4, f2: 9, product: 36, isSquare: false },
    ],
  },
  {
    number: 5,
    title: 'ضرب‌های ۵',
    count: 5,
    rangeText: '۵×۵ تا ۵×۹',
    color: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-300',
      badgeBg: 'bg-cyan-100 text-cyan-900',
      badgeText: 'text-cyan-700',
      gradient: 'from-cyan-500 to-blue-500',
      accent: 'cyan',
      shadow: 'shadow-cyan-100',
    },
    cards: [
      { id: '5x5', f1: 5, f2: 5, product: 25, isSquare: true },
      { id: '5x6', f1: 5, f2: 6, product: 30, isSquare: false },
      { id: '5x7', f1: 5, f2: 7, product: 35, isSquare: false },
      { id: '5x8', f1: 5, f2: 8, product: 40, isSquare: false },
      { id: '5x9', f1: 5, f2: 9, product: 45, isSquare: false },
    ],
  },
  {
    number: 6,
    title: 'ضرب‌های ۶',
    count: 4,
    rangeText: '۶×۶ تا ۶×۹',
    color: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-300',
      badgeBg: 'bg-indigo-100 text-indigo-900',
      badgeText: 'text-indigo-700',
      gradient: 'from-indigo-500 to-violet-500',
      accent: 'indigo',
      shadow: 'shadow-indigo-100',
    },
    cards: [
      { id: '6x6', f1: 6, f2: 6, product: 36, isSquare: true },
      { id: '6x7', f1: 6, f2: 7, product: 42, isSquare: false },
      { id: '6x8', f1: 6, f2: 8, product: 48, isSquare: false },
      { id: '6x9', f1: 6, f2: 9, product: 54, isSquare: false },
    ],
  },
  {
    number: 7,
    title: 'ضرب‌های ۷',
    count: 3,
    rangeText: '۷×۷ تا ۷×۹',
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      badgeBg: 'bg-purple-100 text-purple-900',
      badgeText: 'text-purple-700',
      gradient: 'from-purple-500 to-fuchsia-500',
      accent: 'purple',
      shadow: 'shadow-purple-100',
    },
    cards: [
      { id: '7x7', f1: 7, f2: 7, product: 49, isSquare: true },
      { id: '7x8', f1: 7, f2: 8, product: 56, isSquare: false },
      { id: '7x9', f1: 7, f2: 9, product: 63, isSquare: false },
    ],
  },
  {
    number: 8,
    title: 'ضرب‌های ۸',
    count: 2,
    rangeText: '۸×۸ و ۸×۹',
    color: {
      bg: 'bg-violet-50',
      border: 'border-violet-300',
      badgeBg: 'bg-violet-100 text-violet-900',
      badgeText: 'text-violet-700',
      gradient: 'from-violet-600 to-indigo-600',
      accent: 'violet',
      shadow: 'shadow-violet-100',
    },
    cards: [
      { id: '8x8', f1: 8, f2: 8, product: 64, isSquare: true },
      { id: '8x9', f1: 8, f2: 9, product: 72, isSquare: false },
    ],
  },
  {
    number: 9,
    title: 'ضرب‌های ۹',
    count: 1,
    rangeText: 'فقط ۹×۹',
    color: {
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-300',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-900',
      badgeText: 'text-fuchsia-700',
      gradient: 'from-fuchsia-500 to-pink-600',
      accent: 'fuchsia',
      shadow: 'shadow-fuchsia-100',
    },
    cards: [
      { id: '9x9', f1: 9, f2: 9, product: 81, isSquare: true },
    ],
  },
];

const STORAGE_KEY_MASTERED = 'zarbyar_summary_mastered_v2';
const STORAGE_KEY_REVIEW = 'zarbyar_summary_review_v2';

export const SummaryView: React.FC<SummaryViewProps> = ({
  stats,
  onStartPractice,
  onNavigateToLearn,
}) => {
  // Selected active deck (null when on main decks view)
  const [selectedDeckNum, setSelectedDeckNum] = useState<number | null>(null);

  // Active card index in the opened deck
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  // Whether the current flashcard's answer is revealed
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // Mastered & Needs Review state
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MASTERED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [needsReviewIds, setNeedsReviewIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEW);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(masteredIds));
    } catch {
      // ignore
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEW, JSON.stringify(needsReviewIds));
    } catch {
      // ignore
    }
  }, [needsReviewIds]);

  // When changing card or opening deck, reset answer reveal
  useEffect(() => {
    setIsAnswerRevealed(false);
  }, [currentCardIndex, selectedDeckNum]);

  // Active deck object
  const activeDeck = useMemo(() => {
    if (selectedDeckNum === null) return null;
    return DECKS.find((d) => d.number === selectedDeckNum) || null;
  }, [selectedDeckNum]);

  const activeCard = activeDeck ? activeDeck.cards[currentCardIndex] : null;

  // Global total mastered
  const totalMasteredCount = masteredIds.length;
  const totalProgressPercentage = Math.round((totalMasteredCount / 36) * 100);

  // Helper: Mark Mastered
  const handleMarkMastered = (cardId: string) => {
    const nextMastered = masteredIds.includes(cardId) ? masteredIds : [...masteredIds, cardId];
    setMasteredIds(nextMastered);
    setNeedsReviewIds((prev) => prev.filter((id) => id !== cardId));

    // Check if this action completes all 36 cards
    if (nextMastered.length === 36) {
      sounds.playCelebrationSound();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else if (activeDeck && activeDeck.cards.every((c) => c.id === cardId || nextMastered.includes(c.id))) {
      // Completed this specific deck!
      sounds.playLevelComplete();
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
      });
    } else {
      // Single card success ding ✨
      sounds.playDing();
      confetti({
        particleCount: 20,
        spread: 35,
        origin: { y: 0.7 },
      });
    }

    // Auto advance if not last card
    if (activeDeck && currentCardIndex < activeDeck.cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
      }, 300);
    }
  };

  // Helper: Mark Needs Review
  const handleMarkNeedsReview = (cardId: string) => {
    sounds.playWrongSound();
    setNeedsReviewIds((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
    setMasteredIds((prev) => prev.filter((id) => id !== cardId));

    // Auto advance if not last card
    if (activeDeck && currentCardIndex < activeDeck.cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
      }, 300);
    }
  };

  // Open Deck
  const handleOpenDeck = (deckNum: number) => {
    sounds.playDing();
    setSelectedDeckNum(deckNum);
    setCurrentCardIndex(0);
    setIsAnswerRevealed(false);
  };

  // Close Deck
  const handleCloseDeck = () => {
    sounds.playDing();
    setSelectedDeckNum(null);
    setCurrentCardIndex(0);
    setIsAnswerRevealed(false);
  };

  // Next Deck Handler
  const handleNextDeck = () => {
    if (selectedDeckNum !== null && selectedDeckNum < 9) {
      handleOpenDeck(selectedDeckNum + 1);
    } else {
      handleCloseDeck();
    }
  };

  // Reset all
  const handleResetAll = () => {
    if (window.confirm('آیا می‌خواهی پیشرفت مرور تمام ۳۶ ضرب را بازنشانی کنی؟')) {
      setMasteredIds([]);
      setNeedsReviewIds([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6 select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: 8 DECK STACKS (Main Summary Overview)                */}
      {/* ------------------------------------------------------------- */}
      {!activeDeck ? (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl border-4 border-amber-300 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Layers className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                    <span>۸ دسته کارت (۳۶ ضرب)</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                  ⚡ خلاصه ضرب‌ها
                </h1>
                <p className="text-sm font-bold text-amber-100">
                  ضرب‌ها را دسته‌دسته مرور کن!
                </p>
              </div>

              {/* Progress Pill */}
              <div className="bg-white/95 text-slate-900 px-4 py-3 rounded-2xl shadow-md border-2 border-amber-200 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-black">
                  <Trophy className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-500">مجموع مرور:</div>
                  <div className="text-lg font-black text-amber-700 leading-tight">
                    {toPersianDigits(totalMasteredCount)} <span className="text-xs text-slate-400 font-normal">از ۳۶</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient shapes */}
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Educational Concept Callout */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Lightbulb className="w-6 h-6 fill-amber-200 text-slate-950" />
            </div>
            <div className="space-y-0.5 text-right flex-1">
              <h3 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-1.5">
                💡 جای عددها را عوض کنیم، جواب عوض نمی‌شود!
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                روی هر دسته ضرب بزن، کارت‌های روی هم را یکی‌یکی ورق بزن و کل جدول ضرب را سریع یاد بگیر!
              </p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800">
              <span className="flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                پیشرفت کل: {toPersianDigits(totalMasteredCount)} از {toPersianDigits(36)} ضرب
              </span>
              <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-black">
                {toPersianDigits(totalProgressPercentage)}٪
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalProgressPercentage}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* 8 Card Deck Grid (Realistic Stack of Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {DECKS.map((deck) => {
              const deckMasteredCount = deck.cards.filter((c) => masteredIds.includes(c.id)).length;
              const isDeckComplete = deckMasteredCount === deck.count;
              const firstCard = deck.cards[0];

              return (
                <motion.div
                  key={deck.number}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenDeck(deck.number)}
                  className="relative group cursor-pointer pt-3"
                >
                  {/* Underneath Layer Card 2 (Bottom layer peeking) */}
                  <div
                    className={`absolute inset-x-3 top-0 bottom-3 rounded-3xl bg-white border-2 ${deck.color.border} opacity-50 transform rotate-4 group-hover:rotate-6 transition-transform shadow-xs pointer-events-none`}
                  />

                  {/* Underneath Layer Card 1 (Middle layer peeking) */}
                  <div
                    className={`absolute inset-x-1.5 top-1.5 bottom-1.5 rounded-3xl bg-white border-2 ${deck.color.border} opacity-80 transform -rotate-2 group-hover:-rotate-3 transition-transform shadow-sm pointer-events-none`}
                  />

                  {/* Front Main Card */}
                  <div
                    className={`relative rounded-3xl p-5 border-3 ${deck.color.border} bg-white shadow-md group-hover:shadow-xl transition-all flex flex-col justify-between min-h-[220px] text-right overflow-hidden`}
                  >
                    {/* Top Header of the Deck Card */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${deck.color.badgeBg} flex items-center gap-1 shadow-2xs`}>
                        <Layers className="w-3.5 h-3.5" />
                        <span>{toPersianDigits(deck.count)} ضرب</span>
                      </span>

                      {isDeckComplete ? (
                        <span className="bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                          <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />
                          تکمیل
                        </span>
                      ) : deckMasteredCount > 0 ? (
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {toPersianDigits(deckMasteredCount)} از {toPersianDigits(deck.count)}
                        </span>
                      ) : null}
                    </div>

                    {/* Middle: Title & First Multiplication Formula */}
                    <div className="my-auto py-3 text-center space-y-2">
                      <h3 className="text-base font-black text-slate-800 tracking-tight">
                        {deck.title}
                      </h3>

                      {/* Main Formula Highlight on Front Card */}
                      <div className={`bg-gradient-to-r ${deck.color.gradient} text-white rounded-2xl py-3 px-4 shadow-sm border border-white/30 transform group-hover:scale-105 transition-transform`}>
                        <div className="text-2xl font-black tracking-wide dir-rtl flex items-center justify-center gap-2">
                          <span>{toPersianDigits(firstCard.f1)}</span>
                          <span className="text-white/90 text-xl font-black">×</span>
                          <span>{toPersianDigits(firstCard.f2)}</span>
                        </div>
                      </div>

                      {/* Range Subtitle */}
                      <div className="text-xs font-bold text-slate-500 dir-rtl">
                        {toPersianDigits(deck.rangeText)}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-700 group-hover:text-amber-600 transition-colors">
                      <span>ورق زدن کارت‌ها</span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Reset & Practice Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            {totalMasteredCount > 0 && (
              <button
                onClick={handleResetAll}
                className="text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی پیشرفت مرور</span>
              </button>
            )}

            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="mr-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm border-b-2 border-amber-600 flex items-center gap-1.5 cursor-pointer"
              >
                <span>ورود به آزمون و تمرین ضرب</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: OPEN DECK INTERACTIVE FLASHCARDS (ورق زدن کارت‌ها)   */
        /* ------------------------------------------------------------- */
        activeCard && (
          <div className="space-y-6 max-w-xl mx-auto">
            
            {/* Top Navigation Bar inside Deck */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleCloseDeck}
                className="bg-white hover:bg-slate-50 text-slate-700 font-black text-xs px-4 py-2.5 rounded-2xl border-2 border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>بازگشت به دسته‌ها</span>
              </button>

              {/* Current Deck Title & Count Pill */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-2xl border-2 ${activeDeck.color.border} ${activeDeck.color.badgeBg} shadow-2xs`}>
                  {activeDeck.title} ({toPersianDigits(currentCardIndex + 1)} از {toPersianDigits(activeDeck.count)})
                </span>
              </div>
            </div>

            {/* Deck Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentCardIndex + 1) / activeDeck.count) * 100}%`,
                }}
                className={`h-full bg-gradient-to-r ${activeDeck.color.gradient} rounded-full transition-all duration-300`}
              />
            </div>

            {/* 3D Stack of Cards Container */}
            <div className="relative py-4 px-2">
              
              {/* Fake Underneath Stack Card 2 (Bottom layer) */}
              <div
                className={`absolute inset-x-8 top-1 bottom-7 rounded-3xl bg-white border-2 ${activeDeck.color.border} opacity-40 transform rotate-3 shadow-xs pointer-events-none`}
              />

              {/* Fake Underneath Stack Card 1 (Middle layer) */}
              <div
                className={`absolute inset-x-5 top-2.5 bottom-5 rounded-3xl bg-white border-2 ${activeDeck.color.border} opacity-70 transform -rotate-2 shadow-sm pointer-events-none`}
              />

              {/* Active Interactive Front Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard.id}
                  initial={{ scale: 0.92, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsAnswerRevealed((prev) => !prev)}
                  className={`relative rounded-3xl p-6 sm:p-8 border-4 ${activeDeck.color.border} bg-white shadow-xl min-h-[320px] flex flex-col justify-between text-center cursor-pointer overflow-hidden`}
                >
                  
                  {/* Card Status Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      کارت {toPersianDigits(currentCardIndex + 1)} از {toPersianDigits(activeDeck.count)}
                    </span>

                    {masteredIds.includes(activeCard.id) ? (
                      <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        بلدم
                      </span>
                    ) : needsReviewIds.includes(activeCard.id) ? (
                      <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <RotateCcw className="w-3.5 h-3.5" />
                        نیاز به تمرین
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        برای دیدن جواب لمس کن 👆
                      </span>
                    )}
                  </div>

                  {/* Center Problem & Answer Section */}
                  <div className="py-4 space-y-4">
                    
                    {/* Primary Multiplication Formula */}
                    <div className="space-y-1">
                      <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-wide dir-rtl flex items-center justify-center gap-3">
                        <span>{toPersianDigits(activeCard.f1)}</span>
                        <span className="text-amber-500 font-black">×</span>
                        <span>{toPersianDigits(activeCard.f2)}</span>
                        <span className="text-slate-400 font-medium">=</span>
                        {isAnswerRevealed ? (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-amber-600 bg-amber-100 px-3 py-1 rounded-2xl border-2 border-amber-300 font-black"
                          >
                            {toPersianDigits(activeCard.product)}
                          </motion.span>
                        ) : (
                          <span className="text-slate-400 bg-slate-100 px-4 py-1 rounded-2xl border-2 border-dashed border-slate-300 font-black animate-pulse">
                            ؟
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Commutative Equation Section (When Answer is Revealed) */}
                    {isAnswerRevealed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2"
                      >
                        {!activeCard.isSquare ? (
                          <div className="bg-slate-50 border-2 border-amber-200/80 rounded-2xl p-3 max-w-xs mx-auto space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-black">
                              <ArrowUpDown className="w-4 h-4" />
                              <span>ضرب جابه‌جاشده:</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-800 dir-rtl flex items-center justify-center gap-2">
                              <span>{toPersianDigits(activeCard.f2)}</span>
                              <span className="text-amber-500 font-bold">×</span>
                              <span>{toPersianDigits(activeCard.f1)}</span>
                              <span className="text-slate-400">=</span>
                              <span className="text-slate-900 font-black">
                                {toPersianDigits(activeCard.product)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl py-1.5 px-3 max-w-xs mx-auto">
                            ضرب مربعی (دو عدد یکسان هستند)
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Reveal Button Hint */}
                    {!isAnswerRevealed && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAnswerRevealed(true);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-md border-b-2 border-amber-600 inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          <span>نمایش جواب</span>
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Card Bottom: Mastered / Needs Review Options */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkMastered(activeCard.id);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        masteredIds.includes(activeCard.id)
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>بلدم 🟢</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkNeedsReview(activeCard.id);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        needsReviewIds.includes(activeCard.id)
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-2 border-orange-300'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>دوباره تمرین کنم 🔄</span>
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls: Previous / Next Card Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentCardIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentCardIndex === 0}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  currentCardIndex === 0
                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>کارت قبلی</span>
              </button>

              {currentCardIndex < activeDeck.cards.length - 1 ? (
                <button
                  onClick={() => setCurrentCardIndex((prev) => prev + 1)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border-b-2 border-amber-600 transition-all cursor-pointer active:scale-98"
                >
                  <span>کارت بعدی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextDeck}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border-b-2 border-emerald-700 transition-all cursor-pointer active:scale-98"
                >
                  <span>{selectedDeckNum < 9 ? 'دسته بعدی' : 'پایان و بازگشت'}</span>
                  <Sparkles className="w-4 h-4 fill-amber-300" />
                </button>
              )}
            </div>

          </div>
        )
      )}

    </div>
  );
};
