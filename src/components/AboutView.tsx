import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  X, 
  ChevronRight, 
  Sparkles, 
  Lightbulb, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { UserStats } from '../types';
import { sounds } from '../utils/persian';
import { GameCharacter } from './GameCharacter';

interface AboutViewProps {
  stats: UserStats;
  onBack: () => void;
}

// Configs - easily customizable
const SUPPORT_URL = 'https://pay.zarbyar.com'; // آدرس درگاه پرداخت حمایت داوطلبانه
const FEEDBACK_API_URL = ''; // آدرس وب‌هوک یا ای‌پی‌آی دریافت بازخورد

export const AboutView: React.FC<AboutViewProps> = ({ stats, onBack }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('love');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackStatus('sending');

    if (FEEDBACK_API_URL) {
      try {
        await fetch(FEEDBACK_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: feedbackType,
            text: feedbackText,
            username: stats.username,
            totalScore: stats.totalScore,
            deviceStats: stats,
          }),
        });
      } catch (err) {
        console.warn('Feedback submission failed:', err);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setFeedbackStatus('success');

    setTimeout(() => {
      setFeedbackText('');
      setFeedbackStatus('idle');
      setIsFeedbackOpen(false);
    }, 3500);
  };

  const getThankYouMessage = () => {
    if (feedbackType === 'bug') {
      return 'ممنون که اطلاع دادید. بررسی این بازخورد به بهتر شدن ضربیار کمک می‌کند.';
    }
    if (feedbackType === 'idea' || feedbackType === 'education') {
      return 'ممنون از پیشنهادتان. ایده‌های شما به مسیر توسعه ضربیار کمک می‌کنند.';
    }
    return 'ممنون که به بهتر شدن ضربیار کمک می‌کنید. ❤️';
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 text-right space-y-8 animate-fade-in font-sans">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs px-3.5 py-2 rounded-2xl transition-all cursor-pointer border-b-2 border-slate-300 active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت به برنامه</span>
        </button>

        <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
          💛 داستان صمیمی ضربیار
        </span>
      </div>

      {/* 2. Brand Beautiful Hero Header */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100 flex items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>📖</span>
            <span>داستان ضربیار</span>
          </h1>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            یک اپلیکیشن آموزشی که از دغدغه واقعی یک مادر شروع شد.
          </p>
        </div>

        {/* Subtle, non-intrusive side character */}
        <div className="w-16 h-16 shrink-0 bg-white rounded-2xl border-2 border-amber-200 p-1 flex items-center justify-center shadow-xs">
          <GameCharacter characterId="fox" size="xs" expression="thinking" />
        </div>
      </div>

      {/* 3. Introduction Line */}
      <div className="text-slate-700 font-bold text-sm leading-relaxed text-justify">
        <span className="text-amber-600 font-black">ضربیار از یک دغدغه واقعی شروع شد...</span>
      </div>

      {/* 4. UPPER PROMINENT VOLUNTARY SUPPORT CARD */}
      <div className="bg-gradient-to-br from-pink-500/10 via-amber-500/5 to-transparent border-2 border-pink-300 rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full -translate-x-8 -translate-y-8 pointer-events-none" />
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pink-100 rounded-xl text-pink-600 shrink-0">
            <Heart className="w-5 h-5 fill-pink-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm text-slate-900">❤️ اگر ضربیار به شما کمک کرده...</h3>
            <p className="text-[11px] text-slate-600 font-bold leading-relaxed text-justify">
              ضربیار کاملاً رایگان است. اگر فرزندتان با ضربیار جدول ضرب را بهتر یاد گرفت و از برنامه راضی بودید، می‌توانید به صورت کاملاً اختیاری از ادامه توسعه ضربیار و ساخت اپلیکیشن‌های آموزشی مشابه حمایت کنید.
            </p>
          </div>
        </div>

        <div className="pt-1 flex items-center gap-3">
          {SUPPORT_URL ? (
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs py-3 px-4 rounded-2xl border-b-4 border-pink-700 active:scale-98 transition-transform cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>❤️ حمایت از توسعه ضربیار</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 text-slate-500 font-black text-xs py-3 px-4 rounded-2xl border-b-4 border-slate-400 opacity-70 cursor-not-allowed"
            >
              <Heart className="w-4 h-4" />
              <span>حمایت موقتاً غیرفعال است</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Main Story Prose (Fluid, clean typography, NOT nested inside cards) */}
      <div className="space-y-4 text-slate-700 font-bold text-xs sm:text-sm leading-relaxed text-justify max-w-xl mx-auto">
        <p className="text-amber-700 font-black text-base">ضربیار یک پروژه تجاری با هدف فروش آموزش نیست.</p>
        
        <p>
          یک روز متوجه شدم پسرم، بعد از تمام کردن پایه سوم، هنوز در یادگیری جدول ضرب آنقدر که باید مسلط نشده است.
        </p>

        <p>
          شاید برای خیلی از بچه‌ها این موضوع ساده به نظر برسد؛ اما وقتی کمی بیشتر به آن فکر کردم، دیدم شرایط یادگیری بچه‌ها در سال‌های اخیر هم ساده نبوده است.
        </p>

        <p>
          با آنلاین شدن کلاس‌ها و کم شدن حضور و تعامل بچه‌ها در مدرسه، بخشی از تجربه‌ای که بچه‌ها قبلاً در کنار هم و با تمرین و تکرار در کلاس به دست می‌آوردند، کمتر شد.
        </p>

        <p>
          از طرفی جدول ضرب فقط حفظ کردن چند عدد نیست. ضرب، یکی از پایه‌های مهم ریاضی است و در بسیاری از مفاهیمی که بچه‌ها در سال‌های بعد با آن روبه‌رو می‌شوند، دوباره و دوباره به آن نیاز دارند.
        </p>

        <div className="bg-orange-50 text-orange-800 p-4 rounded-2xl border-r-4 border-orange-400 font-black my-4 text-xs sm:text-sm">
          و حالا پسرم پایه سوم را تمام کرده بود و قرار بود وارد پایه چهارم شود... اما من هنوز دغدغه جدول ضرب را داشتم.
        </div>

        <p className="pt-2 text-slate-900 font-black">
          همینجا بود که با خودم گفتم: چرا خودم یک ابزار ساده درست نکنم که بچه‌ها بتوانند ضرب را بدون احساس اجبار، با بازی و تمرین یاد بگیرند؟
        </p>
      </div>

      {/* 6. Section: چرا ضربیار؟ (No redundant cards, elegant typography with subtle margin dividers) */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>چرا ضربیار؟</span>
        </h3>
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-bold leading-relaxed text-justify">
          <p>
            من نمی‌خواستم یک برنامه بسازم که کودک را مجبور کند بنشیند و تعداد زیادی سؤال پشت سر هم جواب بدهد. می‌خواستم یادگیری برایش شبیه یک بازی باشد.
          </p>
          <p>
            کودک تمرین کند، اشتباه کند، دوباره امتحان کند، امتیاز بگیرد، پیشرفت کند و مهم‌تر از همه:
          </p>
          <p className="text-indigo-700 font-black text-center bg-indigo-50 py-2.5 px-4 rounded-2xl">
            «احساس نکند که مجبور است درس بخواند. یادگیری در قالب بازی، تمرین و تجربه.»
          </p>
        </div>
      </div>

      {/* 7. Section: ضربیار برای چه کسی ساخته شده؟ */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>ضربیار برای چه کسی ساخته شده؟</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed text-justify">
          برای تمام بچه‌هایی که می‌خواهند جدول ضرب را یاد بگیرند؛ و برای مادرها و پدرهایی که دوست دارند فرزندشان ضرب را یاد بگیرد، بدون اینکه هر روز مجبور باشند به او بگویند: <span className="text-emerald-700 font-black">«بشین ضرب بخون!»</span>
        </p>
        <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed text-justify">
          هدف ضربیار این است که بخشی از این مسیر را برای کودک جذاب‌تر و برای والدین ساده‌تر کند.
        </p>
      </div>

      {/* 8. Section: یک تصمیم مهم (Highlighted Accent Box) */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-300 rounded-3xl p-5 space-y-3">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 fill-amber-100" />
          <span>یک تصمیم مهم</span>
        </h3>
        <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed text-justify">
          ضربیار را کاملاً رایگان ساخته‌ام. هیچ جدول ضربی قرار نیست پشت پرداخت قفل شود. هیچ کودکی نباید به خاطر اینکه امکان پرداخت ندارد، از بخش آموزشی برنامه محروم شود.
        </p>
        <p className="text-xs sm:text-sm text-slate-900 font-black bg-white/60 py-2 px-3 rounded-xl inline-block">
          هدف اصلی ضربیار ساده است: کمک کنیم بچه‌ها ضرب را یاد بگیرند.
        </p>
      </div>

      {/* 9. SUBTLE SECONDARY SUPPORT CTA AT BOTTOM */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <h4 className="font-black text-xs text-slate-500 text-center">اگر دوست داشتی به ادامه این مسیر کمک کنی ❤️</h4>
        <div className="flex justify-center">
          {SUPPORT_URL ? (
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 font-black text-xs py-2 px-4 rounded-xl border border-pink-300 transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-400" />
              <span>حمایت از توسعه ضربیار</span>
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 font-bold">درگاه حمایت داوطلبانه فعلاً در دسترس نیست</span>
          )}
        </div>
      </div>

      {/* 10. Adult-Oriented Feedback Section for Parents */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          <span>یک چیز دیگر هم برای ما مهم است 💬</span>
        </h3>
        <p className="text-xs text-slate-600 font-bold leading-relaxed text-justify">
          اگر پیشنهادی دارید، اگر جایی از برنامه برایتان سخت یا نامفهوم است، یا اگر فرزندتان با بخشی از ضربیار ارتباط خوبی نگرفت، حتماً به ما بگویید. گاهی بهترین ایده‌ها را نه از پشت میز کار، بلکه از تجربه واقعی بچه‌ها و والدین پیدا می‌کنیم.
        </p>
        
        <button
          onClick={() => {
            setIsFeedbackOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-98 transition-transform cursor-pointer"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>💬 ارسال بازخورد</span>
        </button>
      </div>

      {/* 11. Emotional Signature */}
      <div className="text-center py-6 border-t border-slate-100 space-y-3">
        <h4 className="font-black text-sm text-slate-900">داستان ضربیار هنوز ادامه دارد...</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-bold">
          ضربیار با یک دغدغه کوچک شروع شد: <span className="text-slate-800 font-black">«چطور کمک کنم پسرم ضرب را بهتر یاد بگیرد؟»</span> اما امیدوارم کم‌کم تبدیل شود به چیزی که برای خیلی از بچه‌های دیگر هم مفید باشد.
        </p>
        
        <p className="text-xs text-indigo-600 font-black pt-1">
          اگر فرزندتان با ضربیار جدول ضرب را یاد گرفت، برای من بهترین نتیجه‌ای است که می‌توانستم از ساخت این برنامه بگیرم. ❤️
        </p>

        <div className="pt-4 space-y-1">
          <p className="text-xs font-black text-slate-400">یاد بگیر، بازی کن، پیشرفت کن. ❤️</p>
          <p className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
            ضربیار؛ جایی که ضرب شیرین میشه!
          </p>
        </div>
      </div>

      {/* Back to App Bottom Button */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer border-b-2 border-slate-300 active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت به برنامه</span>
        </button>
      </div>

      {/* Reusable Professional Feedback Modal Overlay */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-5 border-2 border-slate-200 shadow-2xl relative text-right"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                <h3 className="font-black text-sm text-slate-900">ارسال بازخورد صمیمانه</h3>
              </div>

              {feedbackStatus === 'success' ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                  <span className="text-4xl">❤️</span>
                  <h4 className="font-black text-slate-900 text-sm">پیام شما دریافت شد</h4>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed px-2">
                    {getThankYouMessage()}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  {/* Category Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500">نوع بازخورد شما چیست؟</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'love', label: 'نظر کلی ⭐' },
                        { id: 'idea', label: 'پیشنهاد دارم 💡' },
                        { id: 'bug', label: 'گزارش مشکل 🐛' },
                        { id: 'education', label: 'پیشنهاد آموزشی 📚' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFeedbackType(item.id)}
                          className={`p-2 rounded-xl border text-[11px] font-black text-center transition-all cursor-pointer ${
                            feedbackType === item.id
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Text Area */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500">پیام یا پیشنهاد شما</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="بنویسید چه پیشنهادی دارید یا کدام بخش را دوست دارید..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all h-24 resize-none"
                      maxLength={500}
                      required
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={feedbackStatus === 'sending'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                    <span>{feedbackStatus === 'sending' ? 'در حال ارسال...' : 'ارسال بازخورد'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
