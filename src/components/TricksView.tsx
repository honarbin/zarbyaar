import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Zap,
  Layers,
  Award,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Hand
} from 'lucide-react';
import { toPersianDigits, sounds } from '../utils/persian';
import { MathFormula } from './MathFormula';
import { MathExpression } from './MathExpression';


interface TricksViewProps {
  onNavigateToPractice?: () => void;
}

export interface TrickDef {
  id: string;
  title: string;
  category: 'always' | 'special';
  categoryLabel: string;
  icon: string;
  shortDesc: string;
  exampleStr: string;
  explanation: string;
  steps: string[];
  testQuestion: {
    prompt: string;
    f1: number;
    f2: number;
    correctAnswer: number;
    options: number[];
    hint: string;
  };
}

export const TRICK_LIST: TrickDef[] = [
  {
    id: 'trick-1',
    title: 'ترفند ضرب در ۱',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '☝️',
    shortDesc: 'هر عددی که ضرب در ۱ شود، حاصل خودش می‌شود!',
    exampleStr: '۷ × ۱ = ۷',
    explanation: 'ضرب در ۱ یعنی فقط ۱ گروه از آن عدد داریم، پس هیچی تغییر نمی‌کند.',
    steps: [
      'عدد اولیه را نگاه کن (مثلاً ۷).',
      'چون ۱ گروه داریم، همان عدد ۷ را در پاسخ بنویس!'
    ],
    testQuestion: {
      prompt: 'با ترفند ضرب در ۱، حاصل ضرب ۹ × ۱ چقدر می‌شود؟',
      f1: 9,
      f2: 1,
      correctAnswer: 9,
      options: [1, 9, 10, 0],
      hint: 'یک گروه ۹‌تایی همان عدد ۹ است!'
    }
  },
  {
    id: 'trick-2',
    title: 'ترفند ضرب در ۲ (دو برابر کردن)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '✌️',
    shortDesc: 'ضرب در ۲ یعنی عدد را دو بار با خودش جمع کن (دو برابر کردن).',
    exampleStr: '۷ × ۲ = ۷ + ۷ = ۱۴',
    explanation: 'به‌جای جدول ضرب، فقط کافیست عدد را با خودش جمع کنی.',
    steps: [
      'عدد را دو بار کنار هم بنویس: ۷ + ۷',
      'حاصل جمع را حساب کن: ۱۴'
    ],
    testQuestion: {
      prompt: 'با ترفند دو برابر کردن، حاصل ۶ × ۲ چند می‌شود؟',
      f1: 6,
      f2: 2,
      correctAnswer: 12,
      options: [8, 12, 16, 10],
      hint: '۶ را با خودش جمع کن: ۶ + ۶ = ؟'
    }
  },
  {
    id: 'trick-5',
    title: 'ترفند ضرب در ۵ (پایان با ۰ یا ۵)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '🖐️',
    shortDesc: 'حاصل ضرب هر عدد در ۵، همیشه به رقم ۰ یا ۵ ختم می‌شود!',
    exampleStr: '۶ × ۵ = ۳۰  |  ۷ × ۵ = ۳۵',
    explanation: 'اگر عدد زوج باشد حاصل به ۰ ختم می‌شود؛ اگر فرد باشد حاصل به ۵ ختم می‌شود.',
    steps: [
      'عدد فرد × ۵ ➔ پایان با ۵ (مثلاً ۷ × ۵ = ۳۵)',
      'عدد زوج × ۵ ➔ پایان با ۰ (مثلاً ۶ × ۵ = ۳۰)'
    ],
    testQuestion: {
      prompt: 'با ترفند ضرب در ۵، حاصل ۸ × ۵ چند می‌شود؟ (چون ۸ زوج است، باید به ۰ ختم شود)',
      f1: 8,
      f2: 5,
      correctAnswer: 40,
      options: [35, 40, 45, 38],
      hint: 'چون ۸ زوج است، به ۰ ختم می‌شود ➔ ۴۰'
    }
  },
  {
    id: 'trick-10',
    title: 'ترفند ضرب در ۱۰ (اضافه کردن صفر)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '🚀',
    shortDesc: 'ضرب در ۱۰ خیلی ساده است! فقط یک صفر جلوی عدد بگذار.',
    exampleStr: '۸ × ۱۰ = ۸۰',
    explanation: 'هر عددی که در ۱۰ ضرب شود، یک مرتبه به چپ می‌رود و یک صفر در جلوی آن می‌نشیند.',
    steps: [
      'عدد اصلی را بنویس (مثلاً ۸).',
      'یک صفر ۰ به سمت راست آن بچسبان ➔ ۸۰'
    ],
    testQuestion: {
      prompt: 'با ترفند اضافه کردن صفر، حاصل ۹ × ۱۰ چند می‌شود؟',
      f1: 9,
      f2: 10,
      correctAnswer: 90,
      options: [19, 90, 99, 100],
      hint: 'جلوی ۹ یک صفر بگذار ➔ ۹۰'
    }
  },
  {
    id: 'trick-9-fingers',
    title: 'ترفند جادویی انگشتان برای ضرب در ۹',
    category: 'special',
    categoryLabel: 'اعداد ویژه (۹)',
    icon: '🖐️✨',
    shortDesc: 'با ۱۰ انگشت دستت، تمام ضرب‌های جدول ۹ را در ۳ ثانیه بگو!',
    exampleStr: '۹ × ۴ = ۳۶ (انگشت ۴ام خم می‌شود: ۳ انگشت سمت راست، ۶ انگشت سمت چپ)',
    explanation: 'دست‌هایت را باز کن. برای ضرب ۹ × N، انگشت Nام را بخوابان. انگشتان سمت چپ دهگان و سمت راست یکان هستند.',
    steps: [
      '۱۰ انگشت دست را باز کن.',
      'انگشت شماره N را بخوابان.',
      'تعداد انگشتان سمت راست = دهگان | تعداد انگشتان سمت چپ = یکان!'
    ],
    testQuestion: {
      prompt: 'با روش انگشتی، برای ۹ × ۵ کدام انگشت خوابیده و حاصل چند می‌شود؟',
      f1: 9,
      f2: 5,
      correctAnswer: 45,
      options: [45, 54, 36, 40],
      hint: 'انگشت ۵ام خوابیده ➔ ۴ انگشت دهگان و ۵ انگشت یکان = ۴۵'
    }
  },
  {
    id: 'trick-4',
    title: 'ترفند ضرب در ۴ (دو بار دو برابر کردن)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '⚡',
    shortDesc: 'ضرب در ۴ یعنی ۲ بار عدد را دو برابر کن!',
    exampleStr: '۶ × ۴ ➔ ۶ × ۲ = ۱۲ ➔ ۱۲ × ۲ = ۲۴',
    explanation: 'به‌جای حفظ جدول ۴، ابتدا عدد را با خودش جمع کن، سپس حاصل را دوباره با خودش جمع کن.',
    steps: [
      'مرحله ۱: ۶ را دو برابر کن ➔ ۱۲',
      'مرحله ۲: ۱۲ را دوباره دو برابر کن ➔ ۲۴'
    ],
    testQuestion: {
      prompt: 'با دو بار دو برابر کردن، حاصل ۷ × ۴ چند می‌شود؟ (۷ ➔ ۱۴ ➔ ؟)',
      f1: 7,
      f2: 4,
      correctAnswer: 28,
      options: [24, 28, 32, 14],
      hint: '۷ × ۲ = ۱۴، حالا ۱۴ + ۱۴ = ۲۸'
    }
  },
  {
    id: 'trick-8',
    title: 'ترفند ضرب در ۸ (سه بار دو برابر کردن)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '🔥',
    shortDesc: 'ضرب در ۸ یعنی ۳ بار پشت سر هم عدد را دو برابر کن!',
    exampleStr: '۳ × ۸ ➔ ۳ ➔ ۶ ➔ ۱۲ ➔ ۲۴',
    explanation: 'چون ۸ یعنی ۲ × ۲ × ۲، پس سه بار دو برابر کردن حاصل دقیق ضرب در ۸ را می‌دهد.',
    steps: [
      'مرحله ۱: ۳ × ۲ = ۶',
      'مرحله ۲: ۶ × ۲ = ۱۲',
      'مرحله ۳: ۱۲ × ۲ = ۲۴'
    ],
    testQuestion: {
      prompt: 'با سه بار دو برابر کردن، حاصل ۵ × ۸ چند می‌شود؟ (۵ ➔ ۱۰ ➔ ۲۰ ➔ ؟)',
      f1: 5,
      f2: 8,
      correctAnswer: 40,
      options: [35, 40, 48, 50],
      hint: '۵ × ۲ = ۱۰ ➔ ۱۰ × ۲ = ۲۰ ➔ ۲۰ × ۲ = ۴۰'
    }
  },
  {
    id: 'trick-6',
    title: 'ترفند ضرب در ۶ (ضرب در ۵ + ۱ گروه)',
    category: 'always',
    categoryLabel: 'روش همیشگی',
    icon: '🧩',
    shortDesc: 'ابتدا عدد را در ۵ ضرب کن، سپس ۱ بار خود عدد را به آن اضافه کن!',
    exampleStr: '۷ × ۶ ➔ (۷ × ۵) + ۷ = ۳۵ + ۷ = ۴۲',
    explanation: 'چون ضرب در ۵ خیلی آسان است، ابتدا ضرب در ۵ کن و سپس یک گروه اضافه کن.',
    steps: [
      'مرحله ۱: ۷ × ۵ = ۳۵',
      'مرحله ۲: ۳۵ + ۷ = ۴۲'
    ],
    testQuestion: {
      prompt: 'با ترفند (ضرب در ۵ + خود عدد)، حاصل ۸ × ۶ چند می‌شود؟',
      f1: 8,
      f2: 6,
      correctAnswer: 48,
      options: [42, 48, 54, 40],
      hint: '۸ × ۵ = ۴۰، حالا ۴۰ + ۸ = ۴۸'
    }
  },
  {
    id: 'trick-9-ten',
    title: 'ترفند ضرب در ۹ با کمک ۱۰',
    category: 'special',
    categoryLabel: 'اعداد ویژه (۹)',
    icon: '🎯',
    shortDesc: 'عدد را در ۱۰ ضرب کن و سپس خود عدد را از آن کم کن!',
    exampleStr: '۷ × ۹ ➔ (۷ × ۱۰) - ۷ = ۷۰ - ۷ = ۶۳',
    explanation: 'چون ۹ فقط ۱ واحد از ۱۰ کمتر است، ضرب در ۱۰ کن و ۱ بار عدد را تفریق کن.',
    steps: [
      'مرحله ۱: ۷ × ۱۰ = ۷۰',
      'مرحله ۲: ۷۰ - ۷ = ۶۳'
    ],
    testQuestion: {
      prompt: 'با ترفند (ضرب در ۱۰ منهای خود عدد)، حاصل ۶ × ۹ چند می‌شود؟',
      f1: 6,
      f2: 9,
      correctAnswer: 54,
      options: [54, 60, 48, 56],
      hint: '۶ × ۱۰ = ۶۰، حالا ۶۰ - ۶ = ۵۴'
    }
  },
  {
    id: 'trick-11',
    title: 'ترفند جادویی ضرب در ۱۱',
    category: 'special',
    categoryLabel: 'اعداد دو رقمی',
    icon: '🔮',
    shortDesc: 'رقم‌های عدد را از هم باز کن و مجموعشان را وسط بگذار!',
    exampleStr: '۲۳ × ۱۱ ➔ ۲ (۲+۳) ۳ ➔ ۲۵۳',
    explanation: 'برای ضرب اعداد دو رقمی در ۱۱، رقم دهگان را سمت چپ، رقم یکان را سمت راست و مجموع دو رقم را وسط بنویس!',
    steps: [
      'عدد ۲۳ ➔ رقم‌های ۲ و ۳ را جدا کن.',
      'مجموعشان: ۲ + ۳ = ۵',
      'عدد ۵ را بین ۲ و ۳ قرار بده ➔ ۲۵۳!'
    ],
    testQuestion: {
      prompt: 'با ترفند ضرب در ۱۱، حاصل ۳۴ × ۱۱ چند می‌شود؟ (۳ [۳+۴] ۴)',
      f1: 34,
      f2: 11,
      correctAnswer: 374,
      options: [374, 344, 354, 364],
      hint: 'رقم اول ۳، رقم اخر ۴، مجموع ۳+۴=۷ وسط ➔ ۳۷۴'
    }
  },
  {
    id: 'trick-halving',
    title: 'ترفند نصف کردن و دو برابر کردن',
    category: 'special',
    categoryLabel: 'اعداد زوج و ۵',
    icon: '⚖️',
    shortDesc: 'یک عدد را نصف کن و عدد دیگر را دو برابر کن تا ضرب آسان شود!',
    exampleStr: '۱۶ × ۵ ➔ ۸ × ۱۰ = ۸۰  |  ۱۲ × ۲۵ ➔ ۶ × ۵۰ = ۳۰۰',
    explanation: 'اگر یکی از اعداد زوج باشد و دیگری به ۵ ختم شود، با نصف و دو برابر کردن جواب هیچ تغییری نمی‌کند!',
    steps: [
      'عدد زوج ۱۶ را نصف کن ➔ ۸',
      'عدد ۵ را دو برابر کن ➔ ۱۰',
      'ضرب ساده جدید: ۸ × ۱۰ = ۸۰!'
    ],
    testQuestion: {
      prompt: 'با ترفند نصف و دو برابر، حاصل ۱۴ × ۵ چقدر می‌شود؟ (نصف ۱۴ می‌شود ۷، دوبرابر ۵ می‌شود ۱۰)',
      f1: 14,
      f2: 5,
      correctAnswer: 70,
      options: [60, 70, 80, 75],
      hint: '۷ × ۱۰ = ۷۰'
    }
  },
  {
    id: 'trick-swap',
    title: 'خاصیت جابه‌جایی ضرب (جابه‌جا کن!)',
    category: 'always',
    categoryLabel: 'قانون طلایی',
    icon: '🔄',
    shortDesc: 'ترتیب اعداد در ضرب هیچ تفاوتی در حاصل ایجاد نمی‌کند!',
    exampleStr: '۳ × ۷ = ۲۱  و  ۷ × ۳ = ۲۱',
    explanation: 'اگر ضربی برایت سخت بود، جای اعداد را عوض کن! ضرب‌های معکوس همگی یک جواب دارند.',
    steps: [
      'اگر ۷ × ۳ برایت سخت است، آن را به ۳ × ۷ تبدیل کن.',
      'پاسخ هر دو دقیقاً ۲۱ است!'
    ],
    testQuestion: {
      prompt: 'اگر بدانیم ۴ × ۸ = ۳۲ است، حاصل ۸ × ۴ چقدر است؟',
      f1: 8,
      f2: 4,
      correctAnswer: 32,
      options: [32, 28, 36, 40],
      hint: 'با خاصیت جابه‌جایی، جواب تغییری نمی‌کند!'
    }
  }
];

export const TricksView: React.FC<TricksViewProps> = ({ onNavigateToPractice }) => {
  // State for unlocked tricks
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlocked_tricks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    // Default unlocked initially: 1, 2, 5, 10
    return ['trick-1', 'trick-2', 'trick-5', 'trick-10'];
  });

  const [activeTrickId, setActiveTrickId] = useState<string>('trick-1');
  const activeTrick = TRICK_LIST.find((t) => t.id === activeTrickId) || TRICK_LIST[0];

  // Interactive Quiz State inside the active trick
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Interactive Finger Method State (for trick-9-fingers)
  const [foldedFingerIndex, setFoldedFingerIndex] = useState<number>(4); // default 4th finger (9 x 4)

  // Interactive Doubling State (for trick-2)
  const [doubleVal, setDoubleVal] = useState<number>(7);

  // Interactive Double-Twice State (for trick-4)
  const [doubleTwiceVal, setDoubleTwiceVal] = useState<number>(6);

  // Interactive Double-Three-Times State (for trick-8)
  const [doubleThriceVal, setDoubleThriceVal] = useState<number>(3);

  // Interactive Zero-Appending State (for trick-10)
  const [zeroAppendVal, setZeroAppendVal] = useState<number>(8);

  // Interactive 11-Trick State (for trick-11)
  const [elevenVal, setElevenVal] = useState<number>(23);

  // Interactive Halving/Doubling State (for trick-halving)
  const [halvingVal1, setHalvingVal1] = useState<number>(16);
  const [halvingVal2, setHalvingVal2] = useState<number>(5);

  // Interactive Commutative Swap State (for trick-swap)
  const [isSwapped, setIsSwapped] = useState<boolean>(false);

  // Save unlocked tricks
  const markTrickAsMastered = (trickId: string) => {
    if (!unlockedIds.includes(trickId)) {
      const nextUnlocked = [...unlockedIds, trickId];
      // Automatically unlock the next locked trick in list
      const currIdx = TRICK_LIST.findIndex((t) => t.id === trickId);
      if (currIdx >= 0 && currIdx + 1 < TRICK_LIST.length) {
        const nextTrick = TRICK_LIST[currIdx + 1];
        if (!nextUnlocked.includes(nextTrick.id)) {
          nextUnlocked.push(nextTrick.id);
        }
      }
      setUnlockedIds(nextUnlocked);
      localStorage.setItem('unlocked_tricks', JSON.stringify(nextUnlocked));
    }
  };

  const handleQuizAnswer = (opt: number) => {
    setSelectedQuizOption(opt);
    const isCorrect = opt === activeTrick.testQuestion.correctAnswer;

    if (isCorrect) {
      sounds.playCorrectSound();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      markTrickAsMastered(activeTrick.id);
      setQuizFeedback({
        isCorrect: true,
        text: `آفرین! پاسخت کاملاً درست است! 🎉 این ترفند را استاد شدی.`,
      });
    } else {
      sounds.playWrongSound();
      setQuizFeedback({
        isCorrect: false,
        text: `دقت کن! راهنمایی: ${activeTrick.testQuestion.hint}`,
      });
    }
  };

  const handleNextTrick = () => {
    const currentIndex = TRICK_LIST.findIndex((t) => t.id === activeTrickId);
    if (currentIndex >= 0 && currentIndex + 1 < TRICK_LIST.length) {
      const nextTrick = TRICK_LIST[currentIndex + 1];
      setActiveTrickId(nextTrick.id);
      setSelectedQuizOption(null);
      setQuizFeedback(null);
    }
  };

  const isAllMastered = unlockedIds.length >= TRICK_LIST.length;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-5 shadow-lg border-4 border-purple-300 relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="bg-white/20 text-purple-100 text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            محاسبات سریع و هوشمندانه
          </span>
          <span className="text-2xl">🎩✨</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          ترفندخانه (محاسبه سریع ضرب)
        </h1>
        <p className="text-xs text-purple-100 font-bold leading-relaxed">
          روش‌های میان‌بر هوشمندانه برای حل سریع‌تر ضرب‌ها بدون حفظ کردن طوطی‌وار!
        </p>
      </div>

      {/* Pedagogical Note Box */}
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>قانون آموزشی مهم: ترفندها جایگزین «مفهوم ضرب» نیستند!</span>
        </div>
        <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
          ترتیب یادگیری صحیح:{' '}
          <span className="text-amber-900">
            ۱. درک مفهوم گروه ← ۲. جمع تکراری ← ۳. مفهوم ضرب ← ۴. خاصیت جابه‌جایی ← ۵. جدول ضرب ← ۶. ترفندهای هوشمند ← ۷. تمرین سرعتی
          </span>
        </p>
      </div>

      {/* Trophy Badge Progress */}
      <div className="bg-white p-4 rounded-3xl border-2 border-purple-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-xs">
            🏆
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">
              پیشرفت استاد ترفندها
            </div>
            <div className="text-[11px] font-bold text-purple-700 mt-0.5">
              {toPersianDigits(unlockedIds.length)} از {toPersianDigits(TRICK_LIST.length)} ترفند آزاد شده است
            </div>
          </div>
        </div>

        {isAllMastered && (
          <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            استاد کامل!
          </span>
        )}
      </div>

      {/* Trick Selection Tabs (Vertical Scrollable List) */}
      <div className="space-y-2">
        <div className="text-xs font-black text-slate-800 px-1 flex items-center justify-between">
          <span>لیست ترفندها:</span>
          <span className="text-[10px] text-slate-500 font-bold">برای انتخاب رویشان بزنید</span>
        </div>

        <div className="flex flex-col gap-2 max-h-64 sm:max-h-72 overflow-y-auto overflow-x-hidden p-2 pr-1.5 pl-1.5 scroll-smooth rounded-2xl border-2 border-purple-100/80 bg-purple-50/20 shadow-inner">
          {TRICK_LIST.map((trick, index) => {
            const isUnlocked = unlockedIds.includes(trick.id);
            const isActive = trick.id === activeTrickId;

            return (
              <button
                key={trick.id}
                onClick={() => {
                  if (isUnlocked) {
                    setActiveTrickId(trick.id);
                    setSelectedQuizOption(null);
                    setQuizFeedback(null);
                  } else {
                    sounds.playWrongSound();
                  }
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all cursor-pointer text-right flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-101'
                    : isUnlocked
                    ? 'bg-white hover:bg-purple-50/80 text-slate-800 border-purple-200/80 shadow-xs'
                    : 'bg-slate-100/80 text-slate-400 border-slate-200 opacity-70 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trick.icon}</span>
                  <div>
                    <div className="text-xs font-black">{trick.title}</div>
                    <div className={`text-[10px] mt-0.5 font-bold ${
                      isActive ? 'text-purple-100' : 'text-slate-500'
                    }`}>
                      <span>نمونه: </span>
                      <span className="math-expression" dir="ltr">
                        {toPersianDigits(trick.exampleStr)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                      isActive ? 'bg-purple-800 text-purple-100' : 'bg-purple-100/90 text-purple-900'
                    }`}>
                      {trick.categoryLabel}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 bg-slate-200/80 text-slate-500 px-2 py-1 rounded-full text-[9px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>قفل</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TRICK CARD DETAIL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTrick.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="bg-white rounded-3xl p-5 border-2 border-purple-300 shadow-xl space-y-5"
        >
          
          {/* Header of Active Trick */}
          <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-purple-100 rounded-2xl border border-purple-200">
                {activeTrick.icon}
              </span>
              <div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  activeTrick.category === 'always'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {activeTrick.categoryLabel}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {activeTrick.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Short Description & Formula Example */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-2xl text-center space-y-2 shadow-md">
            <p className="text-xs font-black text-purple-100">
              {activeTrick.shortDesc}
            </p>
            <div className="bg-white/95 py-2 px-5 rounded-xl border-2 border-purple-300 inline-block shadow-sm">
              <span className="math-expression text-2xl font-black text-purple-950 inline-block" dir="ltr">
                {toPersianDigits(activeTrick.exampleStr)}
              </span>
            </div>
          </div>

          {/* Step by Step Breakdown */}
          <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 space-y-3">
            <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-700" />
              <span>مراحل محاسبه محسبه‌ ذهنی:</span>
            </div>

            <div className="space-y-2">
              {activeTrick.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-purple-100 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <span className="leading-relaxed">{toPersianDigits(step)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DEDICATED INTERACTIVE ELEMENTS FOR SPECIFIC TRICKS */}
          
          {/* 1. Interactive Finger Method for trick-9-fingers */}
          {activeTrick.id === 'trick-9-fingers' && (
            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 space-y-3 text-center">
              <div className="text-xs font-black text-amber-950 flex items-center justify-center gap-1">
                <Hand className="w-4 h-4 text-amber-600" />
                <span>ابزار تعاملی انگشتان ضرب در ۹</span>
              </div>
              <p className="text-[11px] text-slate-700 font-bold">
                روی هر کدام از ۱۰ انگشت کلیک کن تا بخوابد و حاصل ضرب در ۹ را نشان دهد:
              </p>

              {/* 10 Interactive Fingers */}
              <div className="flex justify-center gap-1.5 py-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((fingerNum) => {
                  const isFolded = fingerNum === foldedFingerIndex;
                  return (
                    <button
                      key={fingerNum}
                      onClick={() => setFoldedFingerIndex(fingerNum)}
                      className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer border-2 ${
                        isFolded
                          ? 'bg-rose-500 text-white border-rose-600 scale-110 shadow-md'
                          : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <span className="text-lg">{isFolded} 👇 : 🖐️</span>
                      <span className="text-[10px] font-black mt-1">
                        {toPersianDigits(fingerNum)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Finger Method Result Breakdown */}
              <div className="bg-white p-3 rounded-xl border border-amber-300 text-xs font-black text-slate-900 space-y-1">
                <div className="text-amber-900 flex justify-center items-center gap-1">
                  <span>ضرب:</span>
                  <MathFormula factor1={9} factor2={foldedFingerIndex} className="text-amber-900" />
                </div>
                <div className="flex justify-center gap-4 text-xs pt-1">
                  <span className="text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                    انگشتان سمت چپ (دهگان): {toPersianDigits(foldedFingerIndex - 1)}
                  </span>
                  <span className="text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                    انگشتان سمت راست (یکان): {toPersianDigits(10 - foldedFingerIndex)}
                  </span>
                </div>
                <div className="text-base text-emerald-600 font-black pt-1">
                  حاصل ضرب = {toPersianDigits(9 * foldedFingerIndex)}
                </div>
              </div>

            </div>
          )}

          {/* 2. Interactive Doubling Button for trick-2 */}
          {activeTrick.id === 'trick-2' && (
            <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-300 text-center space-y-3">
              <div className="text-xs font-black text-sky-950">
                دستگاه دو برابر کننده تعاملی:
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDoubleVal((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 font-black text-base cursor-pointer"
                >
                  -
                </button>
                <div className="text-2xl font-black text-sky-950 bg-white px-4 py-1.5 rounded-xl border border-sky-300">
                  {toPersianDigits(doubleVal)}
                </div>
                <button
                  onClick={() => setDoubleVal((prev) => Math.min(20, prev + 1))}
                  className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 font-black text-base cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sky-200 font-black text-slate-900 text-sm text-center space-y-2">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xs text-slate-400 typo-caption">عبارت ریاضی دو برابر شدن</span>
                  <MathExpression expression={`${doubleVal} × 2 = ${doubleVal} + ${doubleVal} = ${doubleVal * 2}`} size="normal" color="text-slate-900" />
                </div>
              </div>

            </div>
          )}

          {/* 3. Interactive Zero Appending for trick-10 */}
          {activeTrick.id === 'trick-10' && (
            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-300 text-center space-y-3">
              <div className="text-xs font-black text-emerald-950">
                دستگاه اضافه کردن صفر 🚀
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-700">عدد دلخواه:</span>
                <input
                  type="number"
                  value={zeroAppendVal}
                  onChange={(e) => setZeroAppendVal(parseInt(e.target.value, 10) || 1)}
                  className="w-20 text-center py-1.5 px-2 rounded-xl border-2 border-emerald-400 font-black text-lg bg-white"
                />
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-300 text-sm font-black text-slate-900 flex items-center justify-center gap-2 math-expression" dir="ltr">
                <MathFormula factor1={zeroAppendVal} factor2={10} />
                <span>=</span>
                <span className="text-emerald-600 text-xl font-black">{toPersianDigits(zeroAppendVal)}</span>
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-amber-500 text-2xl font-black bg-amber-100 px-2 rounded-lg border border-amber-300"
                >
                  ۰
                </motion.span>
                <span>= {toPersianDigits(zeroAppendVal * 10)}</span>
              </div>

            </div>
          )}

          {/* 4. Interactive Double-Twice for trick-4 */}
          {activeTrick.id === 'trick-4' && (
            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 text-center space-y-3">
              <div className="text-xs font-black text-amber-950">
                دستگاه دو بار دو برابر کردن (ضرب در ۴):
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-bold text-slate-700">عدد:</span>
                <input
                  type="number"
                  value={doubleTwiceVal}
                  onChange={(e) => setDoubleTwiceVal(parseInt(e.target.value, 10) || 1)}
                  className="w-20 text-center py-1.5 px-2 rounded-xl border-2 border-amber-400 font-black text-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-black">
                <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                  <div className="text-amber-900">دو برابر اول (× ۲)</div>
                  <div className="text-base text-slate-800 mt-1">{toPersianDigits(doubleTwiceVal * 2)}</div>
                </div>
                <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl border border-amber-600">
                  <div className="text-slate-950">دو برابر دوم (× ۴)</div>
                  <div className="text-base text-slate-950 font-black mt-1">{toPersianDigits(doubleTwiceVal * 4)}</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Interactive Double-Three-Times for trick-8 */}
          {activeTrick.id === 'trick-8' && (
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 text-center space-y-3">
              <div className="text-xs font-black text-purple-950">
                دستگاه سه بار دو برابر کردن (ضرب در ۸):
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-bold text-slate-700">عدد اصلی:</span>
                <input
                  type="number"
                  value={doubleThriceVal}
                  onChange={(e) => setDoubleThriceVal(parseInt(e.target.value, 10) || 1)}
                  className="w-20 text-center py-1.5 px-2 rounded-xl border-2 border-purple-400 font-black text-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-black">
                <div className="bg-white p-2 rounded-xl border border-purple-200">
                  <div className="text-purple-800 text-[10px]">مرحله ۱ (× ۲)</div>
                  <div className="text-sm text-slate-800 mt-0.5">{toPersianDigits(doubleThriceVal * 2)}</div>
                </div>
                <div className="bg-purple-100 p-2 rounded-xl border border-purple-300">
                  <div className="text-purple-900 text-[10px]">مرحله ۲ (× ۴)</div>
                  <div className="text-sm text-slate-900 mt-0.5">{toPersianDigits(doubleThriceVal * 4)}</div>
                </div>
                <div className="bg-purple-600 text-white p-2 rounded-xl border border-purple-700">
                  <div className="text-purple-100 text-[10px]">مرحله ۳ (× ۸)</div>
                  <div className="text-sm font-black mt-0.5">{toPersianDigits(doubleThriceVal * 8)}</div>
                </div>
              </div>
            </div>
          )}

          {/* 6. Interactive 11-Trick for trick-11 */}
          {activeTrick.id === 'trick-11' && (
            <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-300 text-center space-y-3">
              <div className="text-xs font-black text-indigo-950">
                ماشین حساب جادویی ضرب در ۱۱ (عدد دو رقمی):
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-700">عدد دو رقمی:</span>
                <input
                  type="number"
                  value={elevenVal}
                  onChange={(e) => setElevenVal(Math.min(99, Math.max(10, parseInt(e.target.value, 10) || 10)))}
                  className="w-20 text-center py-1.5 px-2 rounded-xl border-2 border-indigo-400 font-black text-lg bg-white"
                />
              </div>
              {(() => {
                const d1 = Math.floor(elevenVal / 10);
                const d2 = elevenVal % 10;
                const sum = d1 + d2;
                return (
                  <div className="bg-white p-4 rounded-xl border border-indigo-200 text-xs font-black text-slate-900 text-center space-y-2">
                    <div className="flex justify-center">
                      <MathFormula factor1={elevenVal} factor2={11} size="normal" />
                    </div>
                    <div className="text-indigo-800 typo-caption">
                      رقم چپ: {toPersianDigits(d1)} | رقم راست: {toPersianDigits(d2)}
                    </div>
                    <div className="flex flex-col items-center gap-0.5 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[11px] text-slate-400 font-bold">مجموع ارقام:</span>
                      <MathExpression expression={`${d1} + ${d2} = ${sum}`} size="normal" color="text-purple-800" />
                    </div>
                    <div className="text-base text-emerald-600 font-black pt-1 typo-body">
                      حاصل ضرب = {toPersianDigits(elevenVal * 11)}
                    </div>
                  </div>

                );
              })()}
            </div>
          )}

          {/* 7. Interactive Commutative Swap for trick-swap */}
          {activeTrick.id === 'trick-swap' && (
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 text-center space-y-3">
              <div className="text-xs font-black text-purple-950">
                آزمایش تعویض جا (خاصیت جابه‌جایی):
              </div>
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  layout
                  className="text-xl font-black bg-white py-2 px-4 rounded-xl border border-purple-300 shadow-xs"
                >
                  {isSwapped ? (
                    <MathFormula factor1={7} factor2={3} />
                  ) : (
                    <MathFormula factor1={3} factor2={7} />
                  )}
                </motion.div>

                <button
                  type="button"
                  onClick={() => setIsSwapped(!isSwapped)}
                  className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md font-black text-xs cursor-pointer flex items-center gap-1"
                >
                  <span>🔄 جابه‌جا کن</span>
                </button>
              </div>
              <div className="text-xs font-black text-emerald-700 bg-white p-2.5 rounded-xl border border-purple-200">
                جواب در هر دو حالت برابر است با: {toPersianDigits(21)}!
              </div>
            </div>
          )}

          {/* 3. Interactive Quiz Question: "حالا امتحانش کن! 🎮" */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-2xl border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                آزمون ترفند: «حالا امتحانش کن! 🎮»
              </span>
            </div>

            <p className="text-xs font-black text-slate-900">
              {toPersianDigits(activeTrick.testQuestion.prompt)}
            </p>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2">
              {activeTrick.testQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={selectedQuizOption !== null}
                  className={`py-2.5 px-3 rounded-xl font-black text-sm transition-all cursor-pointer border-2 ${
                    selectedQuizOption === opt
                      ? opt === activeTrick.testQuestion.correctAnswer
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                        : 'bg-rose-500 text-white border-rose-600 shadow-md'
                      : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-200 shadow-2xs'
                  }`}
                >
                  {toPersianDigits(opt)}
                </button>
              ))}
            </div>

            {/* Quiz Feedback */}
            {quizFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-xl text-xs font-black text-center ${
                  quizFeedback.isCorrect
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}
              >
                {quizFeedback.text}
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-purple-100">
            <button
              onClick={handleNextTrick}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-md border-b-4 border-purple-800 text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>ترفند بعدی</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            {onNavigateToPractice && (
              <button
                onClick={onNavigateToPractice}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-md border-b-4 border-amber-600 text-xs cursor-pointer shrink-0"
              >
                ورود به تمرینات 🎯
              </button>
            )}
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
