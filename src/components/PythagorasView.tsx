import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Grid,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Trophy,
  ArrowRight,
  Star,
  ChevronRight,
  Maximize2,
  BookOpen
} from 'lucide-react';
import { UserStats } from '../types';
import { toPersianDigits, sounds, getTraditionalPersianMultiplicationPhrase } from '../utils/persian';
import { MathFormula } from './MathFormula';
import { GameCharacter } from './GameCharacter';

interface PythagorasViewProps {
  stats?: UserStats;
  onBack: () => void;
  onStartPractice?: (tableNum: number) => void;
}

type PatternFilter = 'none' | 'squares' | 'multiples5' | 'multiples2' | 'multiples9' | 'symmetry';

interface HiddenCell {
  r: number;
  c: number;
  revealed: boolean;
}

export const PythagorasView: React.FC<PythagorasViewProps> = ({
  stats,
  onBack,
  onStartPractice,
}) => {
  // Mode: 'explore' or 'game'
  const [mode, setMode] = useState<'explore' | 'game'>('explore');

  // Selected cell for explore mode (default: 4x5)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 4, c: 5 });
  const [activeFilter, setActiveFilter] = useState<PatternFilter>('none');
  const [showAreaHighlight, setShowAreaHighlight] = useState<boolean>(true);

  // Hidden cell quiz mode state
  const [hiddenCells, setHiddenCells] = useState<HiddenCell[]>([]);
  const [activeQuizCell, setActiveQuizCell] = useState<HiddenCell | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Initialize hidden cells for game mode
  const initHiddenGame = () => {
    const candidates: { r: number; c: number }[] = [];
    for (let r = 2; r <= 9; r++) {
      for (let c = 2; c <= 9; c++) {
        candidates.push({ r, c });
      }
    }
    // Shuffle & pick 6 random hidden cells
    const shuffled = [...candidates].sort(() => Math.random() - 0.5).slice(0, 6);
    setHiddenCells(shuffled.map((item) => ({ ...item, revealed: false })));
    setQuizScore(0);
    setActiveQuizCell(null);
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
  };

  const handleModeChange = (newMode: 'explore' | 'game') => {
    setMode(newMode);
    sounds.playDing();
    if (newMode === 'game') {
      initHiddenGame();
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (mode === 'explore') {
      setSelectedCell({ r, c });
      sounds.playDing();
    } else {
      // Game mode: check if this cell is hidden
      const cell = hiddenCells.find((h) => h.r === r && h.c === c);
      if (cell && !cell.revealed) {
        setActiveQuizCell(cell);
        setSelectedQuizAnswer(null);
        setQuizFeedback(null);
        sounds.playDing();
      }
    }
  };

  // Generate quiz options for the active cell
  const quizOptions = useMemo(() => {
    if (!activeQuizCell) return [];
    const correct = activeQuizCell.r * activeQuizCell.c;
    const pool = new Set<number>([correct]);

    // Add close believable distractors
    const offsets = [-activeQuizCell.c, activeQuizCell.c, -activeQuizCell.r, activeQuizCell.r, 2, -2, 4, -4, 10, -10];
    for (const offset of offsets) {
      const val = correct + offset;
      if (val > 0 && val <= 100 && val !== correct) {
        pool.add(val);
      }
      if (pool.size >= 4) break;
    }

    while (pool.size < 4) {
      const rand = Math.floor(Math.random() * 80) + 2;
      pool.add(rand);
    }

    return Array.from(pool).sort(() => Math.random() - 0.5);
  }, [activeQuizCell]);

  const handleAnswerQuiz = (chosen: number) => {
    if (!activeQuizCell || quizFeedback) return;
    setSelectedQuizAnswer(chosen);
    const correct = activeQuizCell.r * activeQuizCell.c;

    if (chosen === correct) {
      setQuizFeedback('correct');
      sounds.playCorrectSound();
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      setQuizScore((prev) => prev + 1);

      // Reveal this cell
      setHiddenCells((prev) =>
        prev.map((h) =>
          h.r === activeQuizCell.r && h.c === activeQuizCell.c ? { ...h, revealed: true } : h
        )
      );

      setTimeout(() => {
        setActiveQuizCell(null);
        setSelectedQuizAnswer(null);
        setQuizFeedback(null);
      }, 1200);
    } else {
      setQuizFeedback('wrong');
      sounds.playWrongSound();
      setTimeout(() => {
        setQuizFeedback(null);
        setSelectedQuizAnswer(null);
      }, 1000);
    }
  };

  const isSquare = (r: number, c: number) => r === c;
  const isMultipleOf5 = (r: number, c: number) => (r * c) % 5 === 0;
  const isMultipleOf2 = (r: number, c: number) => (r * c) % 2 === 0;
  const isMultipleOf9 = (r: number, c: number) => (r * c) % 9 === 0;

  const currentProduct = selectedCell.r * selectedCell.c;
  const traditionalPhrase = getTraditionalPersianMultiplicationPhrase(selectedCell.r, selectedCell.c);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 pb-28 space-y-5 text-right font-sans">
      
      {/* 1. Header & Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs px-3.5 py-2 rounded-2xl border-2 border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>جدول فیثاغورس</span>
          </span>
        </div>
      </div>

      {/* 2. Banner Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white rounded-3xl p-5 shadow-md border-4 border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
            شگفتی ریاضیات 🔢
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            جدول تعاملی فیثاغورس
          </h1>
          <p className="text-xs text-indigo-100 font-bold leading-relaxed">
            با لمس هر خانه، رابطه ضرب، خاصیت جابجایی و الگوهای شگفت‌انگیز را کشف کن!
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-900/40 p-1 rounded-2xl flex items-center gap-1 shrink-0 border border-white/20">
          <button
            onClick={() => handleModeChange('explore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'explore'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            🔍 کاوش جدول
          </button>
          <button
            onClick={() => handleModeChange('game')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'game'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            🕵️ خانه‌های گمشده
          </button>
        </div>
      </div>

      {/* 3. Explore Mode: Pattern Filters */}
      {mode === 'explore' && (
        <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>فیلتر الگوها و رازهای جدول:</span>
            </span>

            <button
              onClick={() => setShowAreaHighlight(!showAreaHighlight)}
              className={`text-[10px] font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                showAreaHighlight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {showAreaHighlight ? 'نمایش مساحت: روشن ✅' : 'نمایش مساحت: خاموش ⚪'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'none', label: 'همه خانه‌ها 🌟' },
              { id: 'squares', label: 'اعداد مربعی (قطر جدول) 💎' },
              { id: 'symmetry', label: 'آینه تقارن (نصف جدول) 🪞' },
              { id: 'multiples5', label: 'مضارب ۵ (پایان ۰ یا ۵) 🖐️' },
              { id: 'multiples2', label: 'مضارب ۲ (زوج‌ها) ✌️' },
              { id: 'multiples9', label: 'مضارب ۹ (جادوی ۹) 🪄' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id as PatternFilter);
                  sounds.playDing();
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs scale-102'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Game Mode Banner */}
      {mode === 'game' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-200 text-amber-800 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">
                چالش پیدا کردن خانه‌های پنهان 🕵️‍♂️
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                روی علامت‌های «❓» بزن و حاصل ضرب درست را انتخاب کن!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black bg-white px-3 py-1 rounded-xl border border-amber-200 text-amber-700">
              کشف شده: {toPersianDigits(quizScore)} از {toPersianDigits(hiddenCells.length)}
            </span>
            <button
              onClick={initHiddenGame}
              className="p-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl transition-colors cursor-pointer"
              title="بازی مجدد"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. THE INTERACTIVE 10x10 PYTHAGORAS MATRIX */}
      <div className="bg-white rounded-3xl p-3 sm:p-5 border-3 border-indigo-200 shadow-md overflow-x-auto">
        <div className="min-w-[340px] max-w-full mx-auto">
          
          <table className="w-full border-collapse select-none table-fixed">
            <thead>
              <tr>
                {/* Top-Right Corner (RTL: multiplier icon) */}
                <th className="w-7 h-7 sm:w-10 sm:h-10 text-center bg-indigo-600 text-white font-black text-xs sm:text-sm rounded-tr-xl border border-indigo-300">
                  ×
                </th>
                {/* Column Headers 1 to 10 */}
                {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => {
                  const isColSelected = selectedCell.c === c && mode === 'explore';
                  return (
                    <th
                      key={`col-${c}`}
                      className={`w-7 h-7 sm:w-10 sm:h-10 text-center font-black text-xs sm:text-sm border border-indigo-200 transition-colors ${
                        isColSelected
                          ? 'bg-sky-500 text-white scale-105 shadow-sm'
                          : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                      }`}
                    >
                      {toPersianDigits(c)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, rIdx) => {
                const r = rIdx + 1;
                const isRowSelected = selectedCell.r === r && mode === 'explore';

                return (
                  <tr key={`row-${r}`}>
                    {/* Row Header */}
                    <th
                      className={`w-7 h-7 sm:w-10 sm:h-10 text-center font-black text-xs sm:text-sm border border-indigo-200 transition-colors ${
                        isRowSelected
                          ? 'bg-amber-500 text-white scale-105 shadow-sm'
                          : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                      }`}
                    >
                      {toPersianDigits(r)}
                    </th>

                    {/* Table Data Cells */}
                    {Array.from({ length: 10 }, (_, cIdx) => {
                      const c = cIdx + 1;
                      const product = r * c;

                      // Explore mode states
                      const isIntersection = selectedCell.r === r && selectedCell.c === c;
                      const isCommutativePair = selectedCell.c === r && selectedCell.r === c && !isIntersection;
                      const isInRow = selectedCell.r === r && mode === 'explore';
                      const isInCol = selectedCell.c === c && mode === 'explore';
                      const isInArea =
                        showAreaHighlight &&
                        mode === 'explore' &&
                        r <= selectedCell.r &&
                        c <= selectedCell.c;

                      // Pattern filters
                      const matchesSquare = activeFilter === 'squares' && isSquare(r, c);
                      const matchesMult5 = activeFilter === 'multiples5' && isMultipleOf5(r, c);
                      const matchesMult2 = activeFilter === 'multiples2' && isMultipleOf2(r, c);
                      const matchesMult9 = activeFilter === 'multiples9' && isMultipleOf9(r, c);
                      const isTopDiagonal = activeFilter === 'symmetry' && r <= c;

                      // Game mode states
                      const hiddenItem = mode === 'game' ? hiddenCells.find((h) => h.r === r && h.c === c) : null;
                      const isHidden = hiddenItem && !hiddenItem.revealed;

                      // Compute Cell Background & Styling
                      let bgClass = 'bg-white text-slate-800 hover:bg-indigo-50/80';

                      if (mode === 'game' && isHidden) {
                        bgClass =
                          'bg-amber-400 text-slate-950 font-black animate-pulse cursor-pointer border-2 border-amber-600';
                      } else if (mode === 'explore') {
                        if (isIntersection) {
                          bgClass =
                            'bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black shadow-lg scale-110 z-10 border-2 border-white ring-2 ring-indigo-500';
                        } else if (isCommutativePair) {
                          bgClass =
                            'bg-pink-500 text-white font-black animate-bounce shadow-md border-2 border-dashed border-white ring-2 ring-pink-400';
                        } else if (isInRow) {
                          bgClass = 'bg-amber-100 text-amber-950 font-black border-amber-300';
                        } else if (isInCol) {
                          bgClass = 'bg-sky-100 text-sky-950 font-black border-sky-300';
                        } else if (isInArea) {
                          bgClass = 'bg-indigo-50/70 text-indigo-900 font-bold';
                        }

                        // Pattern filter overlays
                        if (matchesSquare) {
                          bgClass = 'bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-300';
                        } else if (matchesMult5) {
                          bgClass = 'bg-amber-400 text-slate-950 font-black border-amber-500';
                        } else if (matchesMult2) {
                          bgClass = 'bg-sky-400 text-slate-950 font-bold border-sky-500';
                        } else if (matchesMult9) {
                          bgClass = 'bg-purple-500 text-white font-black border-purple-600 ring-1 ring-purple-300';
                        } else if (activeFilter === 'symmetry' && isTopDiagonal) {
                          bgClass = 'bg-rose-100 text-rose-950 font-bold border-rose-200';
                        }
                      }

                      return (
                        <td
                          key={`cell-${r}-${c}`}
                          onClick={() => handleCellClick(r, c)}
                          className={`w-7 h-7 sm:w-10 sm:h-10 text-center font-black text-[11px] sm:text-xs border border-slate-200 cursor-pointer transition-all duration-150 relative ${bgClass}`}
                          title={`${r} × ${c} = ${product}`}
                        >
                          {isHidden ? '❓' : toPersianDigits(product)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </div>

      {/* 6. Active Cell Detail & Commutative Explorer Card */}
      {mode === 'explore' && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-3xl p-5 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {toPersianDigits(currentProduct)}
              </div>
              <div>
                <div className="flex items-center gap-2 py-0.5">
                  <MathFormula
                    factor1={selectedCell.r}
                    factor2={selectedCell.c}
                    answer={currentProduct}
                    size="large"
                    symbolColor="text-indigo-600 font-black"
                  />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {traditionalPhrase}
                </p>
              </div>
            </div>

            {/* Actions: Practice this table */}
            {onStartPractice && (
              <button
                onClick={() => onStartPractice(selectedCell.r)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-2xl border-b-3 border-indigo-800 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>تمرین جدول {toPersianDigits(selectedCell.r)}</span>
              </button>
            )}
          </div>

          {/* Commutative Property & Repeated Addition Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Box 1: Commutative Property */}
            <div className="bg-white rounded-2xl p-3.5 border border-indigo-100 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-pink-600 font-black text-xs">
                <Sparkles className="w-4 h-4" />
                <span>خاصیت جابجایی (آینه‌ای):</span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed flex flex-wrap items-center gap-1.5">
                <MathFormula factor1={selectedCell.r} factor2={selectedCell.c} size="small" />
                <span>با</span>
                <MathFormula factor1={selectedCell.c} factor2={selectedCell.r} size="small" />
                <span>برابر است با</span>
                <span className="font-black text-slate-900">{toPersianDigits(currentProduct)}</span>.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                یعنی اگر جای دو عدد را عوض کنی، حاصل هیچ تغییری نمی‌کند!
              </p>
            </div>

            {/* Box 2: Repeated Addition (Concept) */}
            <div className="bg-white rounded-2xl p-3.5 border border-indigo-100 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-600 font-black text-xs">
                <Grid className="w-4 h-4" />
                <span>مفهوم جمع تکراری و مساحت:</span>
              </div>
              <div className="text-xs font-bold text-slate-700 leading-relaxed space-y-1">
                <p>
                  یعنی <span className="font-black text-indigo-700">{toPersianDigits(selectedCell.r)}</span> دستهٔ{' '}
                  <span className="font-black text-indigo-700">{toPersianDigits(selectedCell.c)}</span> تایی:
                </p>
                <div dir="ltr" className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-black text-slate-900">
                  {Array.from({ length: selectedCell.r }, () => toPersianDigits(selectedCell.c)).join(' + ')} = {toPersianDigits(currentProduct)}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                مساحت یک مستطیل با ابعاد {toPersianDigits(selectedCell.r)} در {toPersianDigits(selectedCell.c)} برابر است با {toPersianDigits(currentProduct)} خانه.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 7. Hidden Cell Quiz Modal Overlay */}
      <AnimatePresence>
        {activeQuizCell && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 border-3 border-amber-300 shadow-2xl space-y-5 text-center relative"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  خانهٔ سطر {toPersianDigits(activeQuizCell.r)} و ستون {toPersianDigits(activeQuizCell.c)}
                </span>
                <div className="flex justify-center items-center py-2">
                  <MathFormula
                    factor1={activeQuizCell.r}
                    factor2={activeQuizCell.c}
                    answer="؟"
                    size="display"
                    symbolColor="text-amber-500 font-black"
                  />
                </div>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-2 gap-3">
                {quizOptions.map((opt) => {
                  const isSelected = selectedQuizAnswer === opt;
                  const isCorrect = opt === activeQuizCell.r * activeQuizCell.c;

                  let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';

                  if (quizFeedback && isSelected) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500 border-emerald-600 text-white scale-105';
                    } else {
                      btnStyle = 'bg-rose-500 border-rose-600 text-white animate-shake';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerQuiz(opt)}
                      disabled={quizFeedback !== null}
                      className={`py-3.5 px-4 rounded-2xl border-2 font-black text-lg transition-all cursor-pointer shadow-xs active:scale-95 ${btnStyle}`}
                    >
                      {toPersianDigits(opt)}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {quizFeedback === 'correct' && (
                <div className="text-emerald-600 font-black text-sm animate-bounce flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>آفرین! جواب کاملاً درسته 🎉</span>
                </div>
              )}
              {quizFeedback === 'wrong' && (
                <div className="text-rose-600 font-black text-sm flex items-center justify-center gap-1.5">
                  <XCircle className="w-5 h-5" />
                  <span>دوباره دقت کن قهرمان!</span>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setActiveQuizCell(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                انصراف و برگشت به جدول
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
