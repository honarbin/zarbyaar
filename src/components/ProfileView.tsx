import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { User, Award, BrainCircuit, Edit2, Check, Sparkles, AlertCircle, Play, ShieldAlert, GraduationCap, ChevronLeft, Heart, MessageSquare, Send, X, Info } from 'lucide-react';
import { UserStats, Badge, DifficultyLevel } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';
import { MathFormula } from './MathFormula';
import { ALL_BADGES, getWeaknessList, saveUserStats } from '../utils/storage';
import { GameCharacter, CHARACTERS_METADATA, CharacterId } from './GameCharacter';

interface ProfileViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onStartFocusedPractice: () => void;
  onNavigateToRecords?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToPythagoras?: () => void;
  onNavigateToWorksheet?: () => void;
}

// Support & Feedback Config
const SUPPORT_URL = 'https://pay.zarbyar.com'; // قابل تنظیم برای آدرس پرداخت نهایی حمایت
const FEEDBACK_API_URL = ''; // قابل تنظیم برای آدرس API یا وب‌هوک دریافت بازخورد

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  onUpdateStats,
  onStartFocusedPractice,
  onNavigateToRecords,
  onNavigateToAbout,
  onNavigateToPythagoras,
  onNavigateToWorksheet,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(stats.username || 'قهرمان کوچک');
  const [activeExpression, setActiveExpression] = useState<'idle' | 'correct' | 'wrong' | 'thinking' | 'celebration'>('idle');

  const weaknesses = getWeaknessList(stats);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...stats, username: nameInput.trim() };
    saveUserStats(updated);
    onUpdateStats(updated);
    setIsEditingName(false);
  };

  const handleSelectCharacter = (charId: string) => {
    const updated = { ...stats, avatar: charId };
    saveUserStats(updated);
    onUpdateStats(updated);
    setActiveExpression('correct');
    sounds.playCorrectSound();
    setTimeout(() => setActiveExpression('idle'), 1500);
  };

  const handleInteractiveClick = () => {
    const expressions: ('correct' | 'celebration' | 'thinking')[] = ['correct', 'celebration', 'thinking'];
    const randomExpr = expressions[Math.floor(Math.random() * expressions.length)];
    setActiveExpression(randomExpr);
    sounds.playCorrectSound();
    setTimeout(() => setActiveExpression('idle'), 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-3xl p-6 shadow-lg border-4 border-indigo-300 space-y-4 text-center relative overflow-hidden">
        
        {/* Dynamic Character Showcase */}
        <div className="flex flex-col items-center gap-2">
          <div 
            onClick={handleInteractiveClick}
            className="w-32 h-32 rounded-full bg-white/25 flex items-center justify-center shadow-lg border-4 border-white/60 cursor-pointer hover:scale-105 active:scale-95 transition-all p-3 relative"
            title="قهرمانت رو انتخاب کن"
          >
            <GameCharacter
              characterId={(stats.avatar as any) || 'fox'}
              expression={activeExpression}
              size="xl"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full border border-amber-200 animate-bounce">
              قهرمانت رو انتخاب کن ✨
            </div>
          </div>

          {/* Username Input or Display */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-white/20 p-1 rounded-2xl">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-white text-slate-900 font-bold px-3 py-1 rounded-xl text-center text-sm w-36 outline-none"
                  maxLength={15}
                />
                <button
                  onClick={handleSaveName}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-xl cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{stats.username}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="bg-white/20 hover:bg-white/30 p-1.5 rounded-xl text-white cursor-pointer transition-colors"
                  title="ویرایش نام"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-indigo-100 font-bold">
            امتیاز کل تو: {toPersianDigits(stats.totalScore)} ستاره ⭐
          </p>
        </div>

      </div>

      {/* Parent Progress Report Link Card */}
      {onNavigateToRecords && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-indigo-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>گزارش و پیشرفت تحصیلی</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  ویژه والدین
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                مشاهده تحلیل جدول‌ها، مرور اشتباهات و آمار دقیق یادگیری
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToRecords}
            className="shrink-0 bg-white hover:bg-amber-100 text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>مشاهده گزارش</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 📖 داستان ضربیار و حمایت اختیاری */}
      {onNavigateToAbout && (
        <div className="bg-gradient-to-br from-pink-500/10 via-amber-500/5 to-transparent border-2 border-pink-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 mt-0.5">
              <Heart className="w-5 h-5 fill-pink-300 animate-pulse" />
            </div>
            <div className="space-y-0.5 flex-1">
              <h3 className="font-black text-sm text-slate-900">📖 داستان ضربیار</h3>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                می‌خواهی بدانی چرا ضربیار ساخته شد؟
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAbout}
            className="w-full sm:w-auto shrink-0 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl border-b-4 border-pink-700 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>مشاهده داستان ←</span>
          </button>
        </div>
      )}

      {/* 🛠️ ابزارهای ویژه یادگیری و آموزش */}
      {(onNavigateToPythagoras || onNavigateToWorksheet) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onNavigateToPythagoras && (
            <button
              onClick={onNavigateToPythagoras}
              className="bg-indigo-50 hover:bg-indigo-100/80 border-2 border-indigo-200 p-4 rounded-3xl text-right flex items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  کاوش الگوها
                </span>
                <h4 className="text-xs font-black text-slate-900">جدول تعاملی فیثاغورس</h4>
                <p className="text-[10px] text-slate-500 font-bold">شگفتی ماتریس ضرب و تقارن</p>
              </div>
              <span className="text-lg">🔢</span>
            </button>
          )}

          {onNavigateToWorksheet && (
            <button
              onClick={onNavigateToWorksheet}
              className="bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-200 p-4 rounded-3xl text-right flex items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  چاپ و آزمون A4
                </span>
                <h4 className="text-xs font-black text-slate-900">سازنده کاربرگ چاپی</h4>
                <p className="text-[10px] text-slate-500 font-bold">تولید تمرین PDF با پاسخ‌نامه</p>
              </div>
              <span className="text-lg">🖨️</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Character Selector Section (Cards Grid) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-300" />
          <h3 className="font-black text-lg">انتخاب قهرمان ضرب‌بار 🏆</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {(Object.keys(CHARACTERS_METADATA) as CharacterId[]).map((charId) => {
            const meta = CHARACTERS_METADATA[charId];
            const isSelected = stats.avatar === charId;
            return (
              <div
                key={charId}
                className={`bg-white rounded-3xl p-5 border-3 transition-all flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 ring-4 ring-emerald-100 shadow-md'
                    : 'border-slate-200 hover:border-indigo-300 shadow-sm'
                }`}
              >
                {/* Character preview */}
                <div className="w-24 h-24 flex items-center justify-center bg-slate-50 rounded-2xl p-2 border border-slate-100 shrink-0">
                  <GameCharacter
                    characterId={charId}
                    expression={isSelected ? 'cheering' : 'idle'}
                    size="lg"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-right space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-black text-slate-900 text-base">{meta.name}</h4>
                    {isSelected && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                        قهرمان فعال
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-indigo-600">{meta.tagline}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{meta.description}</p>
                </div>

                {/* Select button */}
                <button
                  onClick={() => handleSelectCharacter(charId)}
                  disabled={isSelected}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
                  }`}
                >
                  {isSelected ? 'قهرمان من انتخاب شده' : 'انتخاب این قهرمان 🚀'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sound Settings Section */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-indigo-200 space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <h3 className="font-black text-base">تنظیمات صدا</h3>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-1 rounded-full">
            افکت‌های صوتی
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div>
              <h4 className="font-bold text-xs text-slate-800">فعال بودن افکت‌های صوتی</h4>
              <p className="text-[11px] text-slate-500">پخش افکت‌های صوتی پاسخ درست، اشتباه و پیروزی</p>
            </div>
            <button
              onClick={() => {
                const updated = { ...stats, soundEnabled: !stats.soundEnabled };
                saveUserStats(updated);
                onUpdateStats(updated);
              }}
              className={`px-4 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                stats.soundEnabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {stats.soundEnabled ? 'روشن' : 'خاموش'}
            </button>
          </div>
        </div>
      </div>

      {/* Weaknesses Analysis Section (ضعف‌های من) */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-3 border-rose-200 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2 text-rose-900">
            <BrainCircuit className="w-6 h-6 text-rose-600" />
            <h3 className="font-black text-base">ضعف‌های من (تحلیل عملکرد)</h3>
          </div>
          <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-1 rounded-full">
            ⭐ نیاز به تمرین بیشتر
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          سیستم بر اساس پاسخ‌های صحیح و اشتباه، ضرب‌هایی را که در آن‌ها نیاز به دقت بیشتر داری شناسایی کرده است:
        </p>

        {/* Weaknesses List */}
        <div className="space-y-2.5">
          {weaknesses.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-rose-50/80 border-2 border-rose-200 p-3.5 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-rose-600">⭐</span>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 flex items-center justify-end dir-ltr">
                    <MathFormula factor1={item.factor1} factor2={item.factor2} />
                  </span>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                    تلاش: {toPersianDigits(item.attempts)} | صحیح: {toPersianDigits(item.correct)} | غلط: {toPersianDigits(item.wrong)}
                  </p>
                </div>
              </div>

              <div className="text-xs bg-rose-200 text-rose-900 font-black px-2.5 py-1 rounded-xl">
                نیاز به تمرین
              </div>
            </div>
          ))}
        </div>

        {/* Targeted Practice Action */}
        <button
          onClick={onStartFocusedPractice}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 px-4 rounded-2xl shadow-md border-b-4 border-rose-700 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>تمرین تمرکزی روی این ضرب‌ها</span>
        </button>
      </div>

      {/* Badges & Medals Section */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-amber-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-amber-100 pb-3">
          <Award className="w-6 h-6 text-amber-500 fill-amber-300" />
          <h3 className="font-black text-base">مدال‌ها و افتخارات کسب‌شده</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = (stats.unlockedBadges || []).includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl shrink-0">{badge.icon}</div>
                <div className="text-right">
                  <h4 className="font-black text-xs text-slate-900 flex items-center gap-1">
                    {badge.title}
                    {isUnlocked && <span className="text-[10px] text-emerald-600 font-bold">✓ کسب‌شده</span>}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
