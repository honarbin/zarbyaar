import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Target,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  Percent,
  Star,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  Compass,
  Check,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { UserStats } from '../types';
import { toPersianDigits } from '../utils/persian';
import {
  getTableDetailedStats,
  getTotalStars,
  getRealMistakesList,
  getSmartRecommendation,
  ALL_BADGES,
  TableDetailedStats
} from '../utils/storage';
import { MathFormula } from './MathFormula';
import { GameCharacter } from './GameCharacter';

interface RecordsViewProps {
  stats: UserStats;
  onStartTablePractice?: (tableNum: number) => void;
  onNavigateToSpeed?: () => void;
  onNavigateToPractice?: () => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  stats,
  onStartTablePractice,
  onNavigateToSpeed,
  onNavigateToPractice,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs_work' | 'mastered'>('all');

  const totalAnswers = stats.totalCorrect + stats.totalWrong;
  const accuracyPercent =
    totalAnswers > 0 ? Math.round((stats.totalCorrect / totalAnswers) * 100) : 0;
  const totalStars = getTotalStars(stats);

  // Compute detailed stats for all tables 1 to 10
  const tablesData: TableDetailedStats[] = [];
  for (let i = 1; i <= 10; i++) {
    tablesData.push(getTableDetailedStats(stats, i));
  }

  // Identify tables needing practice (attempted with wrongs OR low accuracy)
  const weakTables = tablesData
    .filter((t) => (t.totalAttempts > 0 && t.totalWrong > 0) || (t.totalAttempts > 0 && t.accuracy < 75))
    .sort((a, b) => a.accuracy - b.accuracy || b.totalWrong - a.totalWrong);

  // Strong / Mastered tables
  const strongTables = tablesData.filter((t) => t.status === 'mastered' || t.status === 'good');

  // Real recorded mistakes list
  const realMistakes = getRealMistakesList(stats);

  // Smart dynamic recommendation based on child's data
  const recommendation = getSmartRecommendation(stats);

  const filteredTables = tablesData.filter((t) => {
    if (activeFilter === 'needs_work') {
      return (t.totalAttempts > 0 && t.totalWrong > 0) || t.status === 'learning';
    }
    if (activeFilter === 'mastered') {
      return t.status === 'mastered' || t.status === 'good';
    }
    return true;
  });

  const handleActionClick = () => {
    if (recommendation.tableTarget && onStartTablePractice) {
      onStartTablePractice(recommendation.tableTarget);
    } else if (recommendation.type === 'speed_challenge' && onNavigateToSpeed) {
      onNavigateToSpeed();
    } else if (onNavigateToPractice) {
      onNavigateToPractice();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-5 py-6 pb-28 space-y-6">
      
      {/* Header Banner - Clean, Professional & Parental Friendly */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-indigo-500/30 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1.5 text-right flex-1">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold px-3 py-1 rounded-full">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>داشبورد گزارش و پیشرفت یادگیری</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              کارنامه جامع ضربیار
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-md">
              ارزیابی سطح تسلط، تحلیل اشتباهات پرتکرار و پیشنهاد هوشمند تمرین برای والد و مربی
            </p>
          </div>

          <div className="shrink-0 bg-white/10 p-2 rounded-2xl border border-white/10 hidden sm:block">
            <GameCharacter
              characterId={(stats.avatar as any) || 'fox'}
              expression="celebration"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* ۱. خلاصه وضعیت (Key Metric Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>خلاصه وضعیت عملکرد</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-bold">
            دقت کل: %{toPersianDigits(accuracyPercent)}
          </span>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* Total Score */}
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs text-right hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">امتیاز کل</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-300" />
              </div>
            </div>
            <p className="text-xl font-black text-amber-600">
              {toPersianDigits(stats.totalScore)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">مجموع امتیازات کسب‌شده</p>
          </div>

          {/* Stars */}
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs text-right hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">ستاره‌ها</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-300" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-slate-800">
                {toPersianDigits(totalStars)}
              </p>
              <span className="text-xs text-slate-400 font-bold">از ۳۰ ⭐</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">درجه تسلط بر جدول‌ها</p>
          </div>

          {/* Correct Answers */}
          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs text-right hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">پاسخ‌های صحیح</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-black text-emerald-600">
              {toPersianDigits(stats.totalCorrect)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">پاسخ‌های درست ثبت‌شده</p>
          </div>

          {/* Wrong Answers */}
          <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs text-right hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">پاسخ‌های اشتباه</span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <p className="text-xl font-black text-rose-600">
              {toPersianDigits(stats.totalWrong)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">نیاز به تمرین و مرور</p>
          </div>

          {/* Best Streak */}
          <div className="bg-white p-3.5 rounded-2xl border border-orange-200 shadow-xs text-right hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">بهترین زنجیره</span>
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-300" />
              </div>
            </div>
            <p className="text-xl font-black text-orange-600">
              {toPersianDigits(stats.maxStreak)} <span className="text-xs text-slate-400 font-bold">پاسخ</span>
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">تمرکز پیوسته بدون خطا</p>
          </div>

          {/* Best Speed Score */}
          <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs text-right hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-extrabold">رکورد سرعتی</span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-black text-purple-700">
              {toPersianDigits(stats.bestSpeedScore)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">بیشترین امتیاز مسابقه ۶۰ ثانیه‌ای</p>
          </div>

        </div>

        {/* Global Accuracy Progress Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-700">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-indigo-600" />
              <span>شاخص کلی دقت محاسبات:</span>
            </span>
            <span className="text-indigo-600">
              %{toPersianDigits(accuracyPercent)} ({toPersianDigits(stats.totalCorrect)} از {toPersianDigits(totalAnswers)} پاسخ)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${accuracyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ۶. پیشنهاد تمرین هوشمند و داده‌محور (Smart Practice Recommendation) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-amber-300/80 rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 text-right">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                {recommendation.badgeText}
              </span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300" />
                <span>پیشنهاد تمرین امروز (بر اساس داده واقعی)</span>
              </span>
            </div>
            <h4 className="font-black text-base text-slate-900 pt-0.5">
              {recommendation.title}
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {recommendation.description}
            </p>
          </div>

          <button
            onClick={handleActionClick}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 self-center"
          >
            <span>{recommendation.actionLabel}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ۳ و ۵. جدول‌های نیازمند تمرین و مرور اشتباهات */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">نیاز به تمرین بیشتر و مرور اشتباهات</h3>
              <p className="text-[11px] text-slate-500">نقاطی که بیشترین تکرار خطا در آن‌ها دیده شده است</p>
            </div>
          </div>

          <span className="text-[11px] bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full border border-rose-200">
            {toPersianDigits(realMistakes.length)} مورد نیاز به مرور
          </span>
        </div>

        {/* Real recorded mistakes list */}
        {realMistakes.length > 0 ? (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-600 font-medium">
              بیشترین خطاها در ضرب‌های زیر ثبت شده‌اند؛ تمرین متمرکز بر روی این موارد عملکرد کودک را جهش خواهد داد:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {realMistakes.slice(0, 6).map((mistake, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/50 hover:bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-rose-200 text-rose-600 font-black text-xs flex items-center justify-center shadow-xs">
                      {toPersianDigits(idx + 1)}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm flex items-center justify-end dir-ltr">
                        <MathFormula factor1={mistake.factor1} factor2={mistake.factor2} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {toPersianDigits(mistake.wrong)} پاسخ اشتباه از {toPersianDigits(mistake.attempts)} تلاش
                      </p>
                    </div>
                  </div>

                  {onStartTablePractice && (
                    <button
                      onClick={() => onStartTablePractice(mistake.factor1)}
                      className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      تمرین جدول {toPersianDigits(mistake.factor1)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-sm text-emerald-900">هیچ نقطه ضعف تثبیت‌نشده‌ای وجود ندارد!</h4>
            <p className="text-xs text-emerald-700 font-medium">
              کودک تمام ضرب‌های تمرین‌شده را با موفقیت پاسخ داده است یا هنوز خطایی ثبت نشده است.
            </p>
          </div>
        )}

        {/* Weak tables summary pills */}
        {weakTables.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-slate-700">جدول‌های دارای بیشترین خطا:</span>
            {weakTables.map((wt) => (
              <button
                key={wt.tableNum}
                onClick={() => onStartTablePractice && onStartTablePractice(wt.tableNum)}
                className="bg-rose-100/70 hover:bg-rose-200 text-rose-800 border border-rose-300 text-[11px] font-black px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>جدول {toPersianDigits(wt.tableNum)}</span>
                <span className="text-[10px] text-rose-600 opacity-90">({toPersianDigits(wt.totalWrong)} خطا)</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ۲. پیشرفت و تسلط بر جدول‌های ۱ تا ۱۰ (Detailed Table Progress) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">میزان پیشرفت و تسلط بر جدول‌ها</h3>
              <p className="text-[11px] text-slate-500">وضعیت یادگیری و دقت برای هر جدول ضرب ۱ تا ۱۰</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              همه ({toPersianDigits(10)})
            </button>
            <button
              onClick={() => setActiveFilter('needs_work')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                activeFilter === 'needs_work'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              نیازمند تمرین ({toPersianDigits(weakTables.length)})
            </button>
            <button
              onClick={() => setActiveFilter('mastered')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                activeFilter === 'mastered'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              مسلط / خوب ({toPersianDigits(strongTables.length)})
            </button>
          </div>
        </div>

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTables.map((t) => {
            const isMastered = t.status === 'mastered';
            const isGood = t.status === 'good';
            const isLearning = t.status === 'learning';
            const isNotStarted = t.status === 'not_started';

            return (
              <div
                key={t.tableNum}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  isMastered
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : isGood
                    ? 'bg-sky-50/40 border-sky-200 hover:border-sky-300'
                    : isLearning
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Title + Status Badge + Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">
                      جدول {toPersianDigits(t.tableNum)}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isMastered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isGood
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : isLearning
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t.statusLabel}
                    </span>
                  </div>

                  {/* Stars (0 to 3) */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= t.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>پیشرفت تسلط: %{toPersianDigits(t.percentage)}</span>
                    <span>{toPersianDigits(t.masteredCount)} از ۱۰ ضرب</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMastered
                          ? 'bg-emerald-500'
                          : isGood
                          ? 'bg-sky-500'
                          : isLearning
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Stats & Action Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  <div>
                    {t.totalAttempts > 0 ? (
                      <span>
                        تلاش: {toPersianDigits(t.totalAttempts)} | دقت: %{toPersianDigits(t.accuracy)}
                        {t.totalWrong > 0 && (
                          <span className="text-rose-600 mr-1 font-bold">({toPersianDigits(t.totalWrong)} خطا)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">هنوز سؤالی پاسخ داده نشده</span>
                    )}
                  </div>

                  {onStartTablePractice && (
                    <button
                      onClick={() => onStartTablePractice(t.tableNum)}
                      className="text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>تمرین</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ۴. عملکرد در مسابقه سرعتی (Speed Performance Card) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">عملکرد مسابقه سرعتی ۶۰ ثانیه‌ای</h3>
              <p className="text-[11px] text-slate-500">سنجش حضور ذهن و سرعت واکنش در یادآوری ضرب‌ها</p>
            </div>
          </div>

          {onNavigateToSpeed && (
            <button
              onClick={onNavigateToSpeed}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>ورود به چالش</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-purple-50/50 p-2.5 rounded-xl text-center space-y-0.5">
            <p className="text-[10px] text-purple-800 font-bold">بیشترین امتیاز</p>
            <p className="text-lg font-black text-purple-900">{toPersianDigits(stats.bestSpeedScore)}</p>
          </div>
          <div className="bg-purple-50/50 p-2.5 rounded-xl text-center space-y-0.5">
            <p className="text-[10px] text-purple-800 font-bold">بهترین زنجیره</p>
            <p className="text-lg font-black text-purple-900">{toPersianDigits(stats.maxStreak)} پاسخ</p>
          </div>
          <div className="bg-purple-50/50 p-2.5 rounded-xl text-center space-y-0.5">
            <p className="text-[10px] text-purple-800 font-bold">پاسخ‌های صحیح کل</p>
            <p className="text-lg font-black text-purple-900">{toPersianDigits(stats.totalCorrect)}</p>
          </div>
          <div className="bg-purple-50/50 p-2.5 rounded-xl text-center space-y-0.5">
            <p className="text-[10px] text-purple-800 font-bold">دوره‌های تمرین</p>
            <p className="text-lg font-black text-purple-900">{toPersianDigits(stats.totalPractices)}</p>
          </div>
        </div>
      </div>

      {/* مدال‌ها و افتخارات کسب‌شده (Badges Section) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-500 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">نشان‌ها و دستاوردهای کسب‌شده</h3>
              <p className="text-[11px] text-slate-500">پاداش تلاش و استمرار در تمرین‌های روزانه</p>
            </div>
          </div>
          <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full">
            {toPersianDigits((stats.unlockedBadges || []).length)} از {toPersianDigits(ALL_BADGES.length)} مدال
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = (stats.unlockedBadges || []).includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/60 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl shrink-0">{badge.icon}</div>
                <div className="text-right flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-slate-900">{badge.title}</h4>
                    {isUnlocked && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        ✓ کسب‌شده
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
