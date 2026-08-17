import React from 'react';
import { Target, BookOpen, Zap, User, Sparkles, Lightbulb, Layers } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items: { id: AppView; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'concept',
      label: 'مفهوم ضرب',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: 'from-amber-400 to-amber-600',
    },
    {
      id: 'tricks',
      label: 'ترفندخانه',
      icon: <Lightbulb className="w-5 h-5 text-purple-500" />,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'summary',
      label: 'خلاصه ضرب‌ها',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'practice',
      label: 'تمرین',
      icon: <Target className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'learn',
      label: 'جدول‌ها',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-sky-500 to-blue-500',
    },
    {
      id: 'speed',
      label: 'سرعتی',
      icon: <Zap className="w-5 h-5 animate-pulse" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'profile',
      label: 'پروفایل',
      icon: <User className="w-5 h-5" />,
      color: 'from-rose-500 to-red-500',
    },
  ];

  const handleNavClick = (viewId: AppView) => {
    onNavigate(viewId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-amber-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 sm:px-2 py-2">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-700 bg-amber-100/90 font-black scale-105 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-amber-600' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight whitespace-nowrap font-black">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
