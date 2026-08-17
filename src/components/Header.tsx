import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Heart } from 'lucide-react';
import { UserStats, AppView } from '../types';
import { toPersianDigits } from '../utils/persian';
import { GameCharacter } from './GameCharacter';

interface HeaderProps {
  stats: UserStats;
  onToggleSound: () => void;
  onNavigate: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onToggleSound, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-900 shadow-md border-b-4 border-amber-500 px-4 py-2.5 transition-all">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('practice')}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          title="ضربیار - صفحه اصلی"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 animate-pulse text-amber-500 fill-amber-400" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-1">
              ضربیار
              <span className="text-[10px] bg-white/80 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                کودکان
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-800 opacity-90 -mt-0.5">
              یادگیری بازی‌محور جدول ضرب
            </p>
          </div>
        </button>

        {/* Right Controls: Score Pill, Sound Toggle, Profile Avatar */}
        <div className="flex items-center gap-1.5">
          
          {/* داستان صمیمی ضربیار */}
          <button
            onClick={() => onNavigate('about')}
            className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-2xl border-2 border-rose-300 shadow-sm font-black text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="داستان صمیمی ضربیار"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-200" />
            <span className="text-[10px] sm:text-xs">داستان</span>
          </button>

          {/* Total Score & Progress Report Display */}
          <button
            onClick={() => onNavigate('records')}
            className="flex items-center gap-1.5 bg-amber-100/90 hover:bg-white text-amber-900 px-3 py-1.5 rounded-2xl border-2 border-amber-300 shadow-sm font-black text-xs sm:text-sm transition-all cursor-pointer"
            title="گزارش و پیشرفت تحصیلی (ویژه والدین)"
          >
            <Trophy className="w-4 h-4 text-amber-600 fill-amber-400" />
            <span>{toPersianDigits(stats.totalScore)}</span>
            <span className="text-[10px] bg-amber-400/70 text-slate-950 px-1.5 py-0.5 rounded-lg hidden sm:inline font-bold">
              گزارش
            </span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-xl bg-white/30 hover:bg-white/50 text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title={stats.soundEnabled ? 'قطع صدا' : 'وصل صدا'}
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-slate-900" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Profile Avatar Quick Link */}
          <button
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-2xl bg-white/90 border-2 border-amber-300 flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden p-0.5"
            title="پروفایل من"
          >
            <GameCharacter
              characterId={(stats.avatar as any) || 'fox'}
              size="xs"
            />
          </button>

        </div>

      </div>
    </header>
  );
};
