import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ArrowRight, Grid, Sparkles, Play, CheckCircle, Star, Printer, Layers } from 'lucide-react';
import { UserStats } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';
import { getTableProgress } from '../utils/storage';
import { MathFormula } from './MathFormula';
import { MathExpression } from './MathExpression';

interface LearnViewProps {
  stats?: UserStats;
  onStartTablePractice: (tableNum: number) => void;
  onNavigateToConcept?: () => void;
  onNavigateToPythagoras?: () => void;
  onNavigateToWorksheet?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  stats,
  onStartTablePractice,
  onNavigateToConcept,
  onNavigateToPythagoras,
  onNavigateToWorksheet,
}) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeVisualPair, setActiveVisualPair] = useState<{ f1: number; f2: number } | null>(null);
  const [showPreLesson, setShowPreLesson] = useState<boolean>(true);
  const [expandedMultiplier, setExpandedMultiplier] = useState<number | null>(null);

  const handleToggleCard = (f2: number) => {
    sounds.playDing();
    setExpandedMultiplier((prev) => (prev === f2 ? null : f2));
  };

  // Table Cards Overview
  if (selectedTable === null) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        
        {/* Concept Link Banner */}
        {onNavigateToConcept && (
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 p-4 rounded-3xl shadow-md border-4 border-amber-300 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                پیش‌نیاز مهم 💡
              </span>
              <h3 className="text-sm font-black text-slate-950">
                آموزش مفهوم ضرب (جمع تکراری)
              </h3>
              <p className="text-[11px] font-bold text-amber-950">
                قبل از حفظ کردن جدول، مفهوم گروه‌بندی را یاد بگیر!
              </p>
            </div>
            <button
              onClick={onNavigateToConcept}
              className="px-3.5 py-2.5 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded-2xl font-black text-xs shadow-sm cursor-pointer shrink-0"
            >
              شروع مفهوم ←
            </button>
          </div>
        )}

        {/* Special Tools: Pythagoras Table & Printable Worksheet Generator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {onNavigateToPythagoras && (
            <button
              onClick={onNavigateToPythagoras}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white p-4 rounded-3xl shadow-md border-3 border-indigo-300 text-right flex items-center justify-between gap-3 cursor-pointer group hover:scale-[1.02] active:scale-98 transition-all"
            >
              <div className="space-y-1">
                <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  ابزار شگفت‌انگیز 🔢
                </span>
                <h3 className="text-sm font-black text-white">
                  جدول تعاملی فیثاغورس
                </h3>
                <p className="text-[11px] font-bold text-indigo-100 leading-snug">
                  کشف الگوها، خاصیت جابجایی و چالش خانه‌های پنهان
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-white group-hover:text-indigo-900 transition-colors">
                ✨
              </div>
            </button>
          )}

          {onNavigateToWorksheet && (
            <button
              onClick={onNavigateToWorksheet}
              className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white p-4 rounded-3xl shadow-md border-3 border-emerald-300 text-right flex items-center justify-between gap-3 cursor-pointer group hover:scale-[1.02] active:scale-98 transition-all"
            >
              <div className="space-y-1">
                <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  ویژه اولیا و آموزگاران 🖨️
                </span>
                <h3 className="text-sm font-black text-white">
                  کاربرگ‌ساز چاپی (PDF)
                </h3>
                <p className="text-[11px] font-bold text-emerald-100 leading-snug">
                  طراحی و چاپ آزمون‌های استاندارد A4 با پاسخ‌نامه
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-white group-hover:text-emerald-900 transition-colors">
                📄
              </div>
            </button>
          )}
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white rounded-3xl p-6 shadow-lg border-4 border-sky-300 relative overflow-hidden space-y-2">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
            جدول‌های ۱ تا ۱۰
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            کدام جدول ضرب رو می‌خواهی یاد بگیری؟ 📖
          </h2>
          <p className="text-xs text-sky-100 font-medium leading-relaxed">
            یک کارت را انتخاب کن تا جدول ضرب آن را با توضیحات تصویری ببینی.
          </p>
        </div>

        {/* 1 to 10 Table Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const bgColors = [
              'bg-emerald-500 border-emerald-600',
              'bg-amber-500 border-amber-600',
              'bg-sky-500 border-sky-600',
              'bg-purple-500 border-purple-600',
              'bg-rose-500 border-rose-600',
              'bg-teal-500 border-teal-600',
              'bg-indigo-500 border-indigo-600',
              'bg-orange-500 border-orange-600',
              'bg-cyan-500 border-cyan-600',
              'bg-violet-500 border-violet-600',
            ];
            const colorClass = bgColors[(num - 1) % bgColors.length];
            const prog = stats ? getTableProgress(stats, num) : { percentage: 0, stars: 0, masteredCount: 0 };

            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedTable(num);
                  setActiveVisualPair({ f1: num, f2: 1 });
                }}
                className={`p-4 sm:p-5 rounded-2xl ${colorClass} text-white shadow-md border-b-4 text-right flex flex-col justify-between cursor-pointer group min-h-[140px] relative overflow-hidden`}
              >
                <div className="flex justify-between items-start gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white drop-shadow whitespace-nowrap">
                    جدول {toPersianDigits(num)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors shrink-0">
                    📖
                  </div>
                </div>

                {/* Progress bar and Stars */}
                <div className="space-y-1.5 w-full pt-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-white/95">
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <span key={s} className={`text-xs ${s <= prog.stars ? 'text-amber-200 drop-shadow' : 'text-white/30'}`}>
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-lg">
                      {toPersianDigits(prog.masteredCount)} از ۱۰
                    </span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-black/25 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-300 h-full rounded-full transition-all duration-300"
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>
    );
  }

  // Selected Table Detail View
  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-5">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedTable(null);
            setExpandedMultiplier(null);
          }}
          className="flex items-center gap-1 text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-2xl border-2 border-slate-200 font-bold text-xs shadow-sm cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به لیست جدول‌ها</span>
        </button>

        <button
          onClick={() => onStartTablePractice(selectedTable)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-2xl font-black text-xs shadow-md border-b-2 border-amber-600 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-900" />
          <span>تمرین جدول {toPersianDigits(selectedTable)}</span>
        </button>
      </div>

      {/* Table Title Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-5 shadow-lg border-4 border-sky-300 flex items-center justify-between">
        <div>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
            یادگیری دقیق با کارت‌های بازشونده
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            جدول ضرب {toPersianDigits(selectedTable)} 🌟
          </h2>
        </div>
        <div className="text-4xl bg-white/10 p-3 rounded-2xl font-black">
          {toPersianDigits(selectedTable)}×
        </div>
      </div>

      {/* Short Conceptual Lesson Card Before Practice */}
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>درس مفهومی کوتاه جدول {toPersianDigits(selectedTable)} (جمع تکراری)</span>
          </div>
          <button
            onClick={() => setShowPreLesson(!showPreLesson)}
            className="text-[11px] font-bold text-amber-800 underline cursor-pointer"
          >
            {showPreLesson ? 'بستن درس' : 'نمایش ساختار جمع'}
          </button>
        </div>

        {showPreLesson && (
          <div className="bg-white/90 p-4 rounded-xl border border-amber-200 text-sm font-bold text-slate-800 space-y-2">
            <p className="text-xs text-slate-600 font-medium typo-body-small">
              قبل از حفظ کردن، ببین چطور اعداد با جمع تکراری بزرگتر می‌شوند:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {Array.from({ length: 3 }, (_, i) => i + 1).map((multiplier) => {
                const repeatedSumExpr = Array.from({ length: multiplier })
                  .map(() => selectedTable)
                  .join(' + ') + ` = ${selectedTable * multiplier}`;
                const isFullWidth = multiplier === 3;
                return (
                  <div
                    key={multiplier}
                    style={{ gridColumn: isFullWidth ? '1 / -1' : undefined }}
                    className={`bg-amber-100/60 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2 flex-wrap ${
                      isFullWidth ? 'col-span-full sm:col-span-2' : ''
                    }`}
                  >
                    <MathFormula factor1={selectedTable} factor2={multiplier} size="small" className="text-amber-900" />
                    <MathExpression expression={repeatedSumExpr} size="small" color="text-slate-700" symbolColor="text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Multiplication Accordion List */}
      <div className="space-y-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f2) => {
          const result = selectedTable * f2;
          const isExpanded = expandedMultiplier === f2;

          return (
            <motion.div
              key={f2}
              layout
              className={`rounded-2xl border-2 transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white border-amber-400 shadow-lg ring-2 ring-amber-200'
                  : 'bg-white border-sky-100 hover:border-sky-300 shadow-sm'
              }`}
            >
              {/* Card Header Bar */}
              <button
                type="button"
                onClick={() => handleToggleCard(f2)}
                className="w-full p-4 flex items-center justify-between cursor-pointer text-right bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-3 py-1.5 rounded-xl transition-colors ${
                      isExpanded
                        ? 'bg-amber-100 text-amber-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-800'
                    }`}
                  >
                    {isExpanded ? 'بستن ▲' : 'مشاهده توضیحات ▼'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Card header formula view with highlighted multiplier */}
                  <MathFormula
                    factor1={selectedTable}
                    factor2={f2}
                    answer={result}
                    highlightFactor={2}
                    highlightFactorClass="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-xl border border-amber-300/80 font-black"
                    className="text-lg font-black text-slate-800"
                    symbolColor="text-amber-500"
                  />
                </div>
              </button>

              {/* Accordion Expandable Content Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="px-4 pb-5 pt-1 bg-amber-50/40 border-t border-amber-100 space-y-4"
                  >
                    {/* Full Formula & Result Display */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs text-center space-y-2">
                      <div className="text-xs font-bold text-amber-800 typo-caption">عبارت ریاضی:</div>
                      <div className="flex justify-center items-center py-1">
                        <MathFormula
                          factor1={selectedTable}
                          factor2={f2}
                          answer={result}
                          className="text-slate-900 tracking-wide"
                          symbolColor="text-amber-500"
                          size="large"
                        />
                      </div>
                      <div className="text-sm font-extrabold text-slate-700 bg-amber-100/70 py-1.5 px-3 rounded-xl inline-block border border-amber-200 typo-body-small">
                        {toPersianDigits(selectedTable)} دسته‌ی {toPersianDigits(f2)}‌تایی = {toPersianDigits(result)}
                      </div>
                    </div>

                    {/* Visual Dot / Star Representation with Compact Touching Outlined Groups */}
                    <div className="bg-white p-4 rounded-2xl border border-amber-200 text-center space-y-3">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700 border-b border-amber-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Grid className="w-4 h-4 text-amber-500" />
                          <span>نمایش تصویری</span>
                        </div>
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                          {toPersianDigits(selectedTable)} دسته‌ی {toPersianDigits(f2)}‌تایی
                        </span>
                      </div>

                      {/* Touching contiguous group boxes container - zero gap/margin */}
                      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex flex-wrap justify-center items-stretch gap-0 max-h-72 overflow-y-auto">
                        {Array.from({ length: selectedTable }).map((_, groupIdx) => {
                          // Determine compact grid column layout for items inside each group
                          const getItemCols = (count: number) => {
                            if (count <= 3) return count;
                            if (count === 4) return 2;
                            if (count === 5) return 5;
                            if (count === 6) return 3;
                            if (count === 7 || count === 8) return 4;
                            if (count === 9) return 3;
                            return 5; // 10 items -> 2 rows of 5
                          };

                          const cols = getItemCols(f2);

                          return (
                            <div
                              key={groupIdx}
                              className="p-2 bg-white border border-amber-400/80 -mr-[1px] -mb-[1px] flex flex-col items-center justify-center transition-colors hover:bg-amber-50/40"
                            >
                              <div className="text-[10px] font-black text-amber-950 bg-amber-100/90 px-1.5 py-0.5 rounded-xs mb-1.5 border border-amber-300/70">
                                دسته‌ی {toPersianDigits(groupIdx + 1)}
                              </div>

                              <div
                                className="grid gap-1 justify-items-center items-center"
                                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                              >
                                {Array.from({ length: f2 }).map((_, itemIdx) => (
                                  <motion.div
                                    key={itemIdx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: (groupIdx * f2 + itemIdx) * 0.005 }}
                                    className="w-5.5 h-5.5 rounded-full bg-amber-400 border border-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-2xs"
                                  >
                                    ⭐
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
