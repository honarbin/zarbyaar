import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Download,
  FileText,
  HelpCircle,
  Award
} from 'lucide-react';
import { toPersianDigits, sounds } from '../utils/persian';

interface WorksheetViewProps {
  onBack: () => void;
}

type QuestionFormat = 'standard' | 'blank_f1' | 'blank_f2' | 'mixed';

interface GeneratedQuestion {
  id: number;
  f1: number;
  f2: number;
  product: number;
  format: 'standard' | 'blank_f1' | 'blank_f2';
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({ onBack }) => {
  // Configuration states
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9]);
  const [questionCount, setQuestionCount] = useState<number>(24);
  const [questionFormat, setQuestionFormat] = useState<QuestionFormat>('mixed');
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [includeEvaluationTable, setIncludeEvaluationTable] = useState<boolean>(true);
  
  // Sheet Header Details (editable by parent/teacher)
  const [studentName, setStudentName] = useState<string>('');
  const [sheetDate, setSheetDate] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('پایه سوم ابتدایی');
  const [schoolOrTeacher, setSchoolOrTeacher] = useState<string>('');

  // Random seed state to trigger regeneration
  const [seed, setSeed] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Toggle single table
  const handleToggleTable = (num: number) => {
    setSelectedTables((prev) => {
      if (prev.includes(num)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((t) => t !== num);
      } else {
        return [...prev, num].sort((a, b) => a - b);
      }
    });
    sounds.playDing();
  };

  // Presets
  const setPreset = (type: 'all' | 'easy' | 'hard') => {
    sounds.playDing();
    if (type === 'all') setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    if (type === 'easy') setSelectedTables([1, 2, 5, 10]);
    if (type === 'hard') setSelectedTables([6, 7, 8, 9]);
  };

  // Generate Questions
  const questions: GeneratedQuestion[] = useMemo(() => {
    if (selectedTables.length === 0) return [];
    const pool: { f1: number; f2: number }[] = [];

    // Populate all pairs for chosen tables
    selectedTables.forEach((f1) => {
      for (let f2 = 1; f2 <= 10; f2++) {
        pool.push({ f1, f2 });
      }
    });

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, questionCount);

    return chosen.map((pair, idx) => {
      let format: 'standard' | 'blank_f1' | 'blank_f2' = 'standard';
      if (questionFormat === 'blank_f1') format = 'blank_f1';
      else if (questionFormat === 'blank_f2') format = 'blank_f2';
      else if (questionFormat === 'mixed') {
        const rand = idx % 3;
        if (rand === 0) format = 'standard';
        else if (rand === 1) format = 'blank_f2';
        else format = 'blank_f1';
      }

      return {
        id: idx + 1,
        f1: pair.f1,
        f2: pair.f2,
        product: pair.f1 * pair.f2,
        format,
      };
    });
  }, [selectedTables, questionCount, questionFormat, seed]);

  const handleRegenerate = () => {
    setSeed((prev) => prev + 1);
    sounds.playDing();
  };

  // Generates standalone printable HTML for popup window or iframe or file download
  const generatePrintableHtml = (): string => {
    const questionsHtml = questions
      .map((q) => {
        let expr = '';
        if (q.format === 'standard') {
          expr = `<span>${toPersianDigits(q.f1)}</span> <span class="op">×</span> <span>${toPersianDigits(q.f2)}</span> <span class="op">=</span> <span class="dots">........</span>`;
        } else if (q.format === 'blank_f1') {
          expr = `<span class="dots">......</span> <span class="op">×</span> <span>${toPersianDigits(q.f2)}</span> <span class="op">=</span> <span>${toPersianDigits(q.product)}</span>`;
        } else {
          expr = `<span>${toPersianDigits(q.f1)}</span> <span class="op">×</span> <span class="dots">......</span> <span class="op">=</span> <span>${toPersianDigits(q.product)}</span>`;
        }

        return `
          <div class="q-item">
            <span class="q-num">${toPersianDigits(q.id)})</span>
            <div class="q-expr" dir="ltr">${expr}</div>
          </div>
        `;
      })
      .join('');

    const answerKeyHtml = includeAnswerKey
      ? `
      <div class="answer-key">
        <div class="ak-title">🔑 کلید پاسخ‌نامه (جهت تصحیح سریع):</div>
        <div class="ak-grid">
          ${questions
            .map((q) => {
              let ans = q.product;
              if (q.format === 'blank_f1') ans = q.f1;
              if (q.format === 'blank_f2') ans = q.f2;
              return `<div class="ak-item"><span>${toPersianDigits(q.id)}:</span> <strong>${toPersianDigits(ans)}</strong></div>`;
            })
            .join('')}
        </div>
      </div>
    `
      : '';

    const evalHtml = includeEvaluationTable
      ? `
      <div class="eval-section">
        <div class="eval-title">📊 جدول ارزیابی توصیفی آموزگار / ولی:</div>
        <table class="eval-table">
          <thead>
            <tr>
              <th>خیلی خوب 🌟</th>
              <th>خوب 👍</th>
              <th>قابل قبول 👌</th>
              <th>نیاز به آموزش و تلاش بیشتر 🔁</th>
            </tr>
          </thead>
          <tbody>
            <tr><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div class="eval-footer">
          <span>امضای آموزگار / ولی: .......................................</span>
          <span>تاریخ بررسی: .......................................</span>
        </div>
      </div>
    `
      : '';

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>کاربرگ تمرین جدول ضرب - ضربیار</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
    
    * {
      box-sizing: border-box;
      font-family: 'Vazirmatn', Tahoma, system-ui, sans-serif;
    }
    
    body {
      margin: 0;
      padding: 15px;
      background: #f1f5f9;
      color: #0f172a;
    }

    .toolbar {
      max-width: 210mm;
      margin: 0 auto 15px auto;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar button {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .toolbar button.close-btn {
      background: #475569;
    }
    .toolbar button:hover {
      opacity: 0.9;
    }

    .sheet-page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 18mm 16mm;
      box-shadow: 0 0 20px rgba(0,0,0,0.08);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
    }
    .sub-brand {
      font-size: 11px;
      color: #64748b;
    }
    .meta-info {
      font-size: 12px;
      font-weight: bold;
      text-align: left;
    }
    .student-bar {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
    }

    .prompt-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
      color: #854d0e;
      text-align: center;
      margin-bottom: 14px;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 24px;
      row-gap: 16px;
      margin-bottom: 16px;
    }

    .q-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
      font-size: 15px;
      font-weight: 900;
    }
    .q-num {
      font-size: 11px;
      color: #64748b;
      font-weight: bold;
      width: 24px;
    }
    .q-expr {
      direction: ltr !important;
      unicode-bidi: isolate;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 15px;
    }
    .op {
      color: #047857;
      font-weight: 900;
    }
    .dots {
      color: #94a3b8;
      letter-spacing: 2px;
    }

    .eval-section {
      border-top: 2px solid #0f172a;
      padding-top: 10px;
      margin-top: 10px;
    }
    .eval-title {
      font-size: 11px;
      font-weight: 900;
      margin-bottom: 6px;
    }
    .eval-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #0f172a;
      text-align: center;
      font-size: 11px;
      font-weight: bold;
    }
    .eval-table th {
      background: #f8fafc;
      border: 1px solid #0f172a;
      padding: 6px;
    }
    .eval-table td {
      border: 1px solid #0f172a;
      height: 32px;
    }
    .eval-footer {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #475569;
      margin-top: 6px;
      font-weight: bold;
    }

    .answer-key {
      border-top: 1px dashed #94a3b8;
      padding-top: 8px;
      margin-top: 8px;
    }
    .ak-title {
      font-size: 10px;
      font-weight: 900;
      color: #64748b;
      margin-bottom: 4px;
    }
    .ak-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 4px;
      background: #f8fafc;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 10px;
      text-align: center;
    }
    .ak-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .footer-brand {
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      margin-top: 10px;
    }

    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .toolbar {
        display: none !important;
      }
      .sheet-page {
        max-width: 100% !important;
        min-height: 100% !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      @page {
        size: A4 portrait;
        margin: 12mm 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div style="font-size: 13px; font-weight: bold;">
      📄 پیش‌نمایش چاپ و خروجی PDF کاربرگ ضربیار
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()">🖨️ چاپ / ذخیره PDF</button>
      <button class="close-btn" onclick="window.close()">❌ بستن</button>
    </div>
  </div>

  <div class="sheet-page">
    <div>
      <div class="header-box">
        <div class="top-row">
          <div>
            <div class="brand-title">✖️ کاربرگ و تمرین جدول ضرب</div>
            <div class="sub-brand">سامانه آموزشی ضربیار</div>
          </div>
          <div class="meta-info">
            <div>پایه: ${gradeLevel}</div>
            ${schoolOrTeacher ? `<div>مدرسه/آموزگار: ${schoolOrTeacher}</div>` : ''}
          </div>
        </div>

        <div class="student-bar">
          <div>نام و نام خانوادگی: <span style="font-weight: normal;">${studentName || '...............................'}</span></div>
          <div>تاریخ: <span style="font-weight: normal;">${sheetDate || '...... / ...... / ......'}</span></div>
          <div>نمره / بازخورد: <span style="font-weight: normal;">.......................</span></div>
        </div>
      </div>

      <div class="prompt-box">
        ⭐ دانشمند کوچک، به سؤالات زیر با دقت و حوصله پاسخ بده و حاصل هر عبارت را در جای خالی بنویس:
      </div>

      <div class="grid-container">
        ${questionsHtml}
      </div>
    </div>

    <div>
      ${evalHtml}
      ${answerKeyHtml}
      <div class="footer-brand">
        تولید شده توسط ضربیار؛ یادگیری شیرین جدول ضرب با بازی و تمرین ❤️
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print failed:', e);
        }
      }, 500);
    });
  </script>
</body>
</html>`;
  };

  // Robust Print Action
  const handlePrint = () => {
    sounds.playDing();
    setStatusMessage('در حال آماده‌سازی پنجره چاپ برگه...');

    const htmlContent = generatePrintableHtml();

    try {
      // 1. Try opening new window (most reliable across desktop and mobile browsers)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setStatusMessage('پنجره چاپ باز شد! در صورت نیاز روی دکمه چاپ کلیک کنید.');
        setTimeout(() => setStatusMessage(null), 4000);
        return;
      }
    } catch (e) {
      console.warn('window.open failed, trying hidden iframe...', e);
    }

    // 2. Fallback: Create hidden iframe to print
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      if (iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(htmlContent);
        iframe.contentWindow.document.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setStatusMessage('پنجره چاپ فعال شد.');
          } catch (err) {
            window.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            setStatusMessage(null);
          }, 2000);
        }, 500);
        return;
      }
    } catch (err) {
      console.warn('iframe print failed, falling back to direct window.print', err);
    }

    // 3. Fallback direct print
    window.print();
    setStatusMessage('دستور چاپ ارسال شد.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Download HTML Worksheet directly
  const handleDownloadHtml = () => {
    sounds.playDing();
    const htmlContent = generatePrintableHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zarbyar-worksheet-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage('فایل کاربرگ آماده چاپ با موفقیت دانلود شد!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCopyText = () => {
    sounds.playDing();
    const textList = questions
      .map((q) => {
        if (q.format === 'standard') return `${toPersianDigits(q.id)}) ${toPersianDigits(q.f1)} × ${toPersianDigits(q.f2)} = .......`;
        if (q.format === 'blank_f1') return `${toPersianDigits(q.id)}) ....... × ${toPersianDigits(q.f2)} = ${toPersianDigits(q.product)}`;
        return `${toPersianDigits(q.id)}) ${toPersianDigits(q.f1)} × ....... = ${toPersianDigits(q.product)}`;
      })
      .join('\n');

    const fullText = `کاربرگ تمرین جدول ضرب ضربیار\nنام دانش‌آموز: ${studentName || '........'}\nپایه: ${gradeLevel}\n\n${textList}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setStatusMessage('متن تمام سؤالات در کلیپ‌بورد کپی شد!');
    setTimeout(() => {
      setCopied(false);
      setStatusMessage(null);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 pb-28 space-y-6 text-right font-sans">
      
      {/* Status / Toast Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header & Navigation (Hidden during print) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs px-3.5 py-2 rounded-2xl border-2 border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>کاربرگ‌ساز چاپی ضربیار</span>
          </span>
        </div>
      </div>

      {/* 2. Banner Header (Hidden during print) */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-3xl p-5 shadow-md border-4 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="space-y-1 text-right">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
            ابزار ویژه والدین و آموزگاران 🖨️
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            سازنده کاربرگ و آزمون چاپی A4
          </h1>
          <p className="text-xs text-emerald-100 font-bold leading-relaxed">
            جدول‌های مورد نظر را انتخاب کنید و با یک کلیک برگه امتحانی استاندارد با کلید پاسخ دریافت کنید.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs px-4 py-3 rounded-2xl shadow-md border-b-4 border-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>چاپ / ذخیره PDF</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1 bg-emerald-700/90 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-3 rounded-2xl border-b-4 border-emerald-900 active:scale-95 transition-all cursor-pointer"
            title="دانلود فایل آماده چاپ"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="p-3 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-2xl transition-all cursor-pointer"
            title="تولید مجدد سؤالات تصادفی"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Worksheet Customizer Control Panel (Hidden during print) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <h3 className="font-black text-sm text-slate-900">تنظیمات و سفارشی‌سازی کاربرگ</h3>
        </div>

        {/* 3.1 Select Multiplication Tables */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700">انتخاب جدول‌های ضرب مورد آزمون:</label>
            <div className="flex items-center gap-1.5 text-[11px] font-black">
              <button
                onClick={() => setPreset('all')}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer"
              >
                همه (۱ تا ۱۰)
              </button>
              <button
                onClick={() => setPreset('easy')}
                className="text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-lg border border-sky-200 cursor-pointer"
              >
                ساده (۱، ۲، ۵، ۱۰)
              </button>
              <button
                onClick={() => setPreset('hard')}
                className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer"
              >
                سخت (۶، ۷، ۸، ۹)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedTables.includes(num);
              return (
                <button
                  key={`tbl-${num}`}
                  onClick={() => handleToggleTable(num)}
                  className={`py-2 px-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ضرب {toPersianDigits(num)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3.2 Question Count & Question Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          
          {/* Question Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>تعداد سؤالات برگه:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {toPersianDigits(questionCount)} سؤال
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[12, 18, 24, 30].map((count) => (
                <button
                  key={`cnt-${count}`}
                  onClick={() => {
                    setQuestionCount(count);
                    sounds.playDing();
                  }}
                  className={`py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {toPersianDigits(count)} سؤال
                </button>
              ))}
            </div>
          </div>

          {/* Question Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">سبک و چینش عبارات ضرب:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'mixed', label: 'ترکیبی متنوع 🎲' },
                { id: 'standard', label: 'حاصل مجهول (۴ × ۵ = ؟)' },
                { id: 'blank_f1', label: 'عامل اول مجهول (؟ × ۵ = ۲۰)' },
                { id: 'blank_f2', label: 'عامل دوم مجهول (۴ × ؟ = ۲۰)' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => {
                    setQuestionFormat(fmt.id as QuestionFormat);
                    sounds.playDing();
                  }}
                  className={`p-2 rounded-xl text-[11px] font-black border text-center transition-all cursor-pointer ${
                    questionFormat === fmt.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 3.3 Student & Sheet Information Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-black text-slate-500 block mb-1">نام دانش‌آموز:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="مثال: علی رضایی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 block mb-1">پایه تحصیلی:</label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="پایه سوم ابتدایی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 block mb-1">تاریخ آزمون:</label>
            <input
              type="text"
              value={sheetDate}
              onChange={(e) => setSheetDate(e.target.value)}
              placeholder="۱۴۰۳/۰۸/۱۵"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 block mb-1">نام آموزگار یا دبستان:</label>
            <input
              type="text"
              value={schoolOrTeacher}
              onChange={(e) => setSchoolOrTeacher(e.target.value)}
              placeholder="دبستان شهید بهشتی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 3.4 Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs font-black text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>درج کلید پاسخ‌نامه در انتهای برگه</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEvaluationTable}
                onChange={(e) => setIncludeEvaluationTable(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>کادر ارزیابی توصیفی آموزگار / ولی</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد!' : 'کپی متن سؤالات'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl border-b-2 border-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ برگه 🖨️</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. THE LIVE PRINTABLE A4 WORKSHEET (This exact container is rendered on screen & print) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-300 shadow-xl text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                ✖️
              </span>
              <div>
                <h2 className="text-base font-black">کاربرگ و تمرین جدول ضرب</h2>
                <p className="text-[11px] text-slate-600 font-bold">سامانه آموزشی ضربیار</p>
              </div>
            </div>

            <div className="text-left space-y-0.5 text-[11px] font-bold text-slate-700">
              <p>پایه: <span className="font-black text-slate-900">{gradeLevel}</span></p>
              {schoolOrTeacher && <p>مدرسه/آموزگار: <span className="font-black text-slate-900">{schoolOrTeacher}</span></p>}
            </div>
          </div>

          {/* Student Info Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-black">
            <div>
              نام و نام خانوادگی: <span className="font-normal text-slate-800">{studentName || '...............................'}</span>
            </div>
            <div className="text-center">
              تاریخ: <span className="font-normal text-slate-800">{sheetDate || '...... / ...... / ......'}</span>
            </div>
            <div className="text-left">
              نمره / بازخورد: <span className="font-normal text-slate-800">.......................</span>
            </div>
          </div>
        </div>

        {/* Motivational Prompt */}
        <div className="text-center text-xs font-black text-slate-700 bg-amber-50/80 border border-amber-200 py-1.5 px-3 rounded-lg print:border-slate-400">
          ⭐ دانشمند کوچک، به سؤالات زیر با دقت و حوصله پاسخ بده و حاصل هر عبارت را در جای خالی بنویس:
        </div>

        {/* Questions Grid (2 columns on mobile, 3 columns on print / tablet) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm font-black pt-2">
          {questions.map((q) => {
            return (
              <div
                key={`q-${q.id}`}
                className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 px-1 text-slate-900"
              >
                {/* Question Number */}
                <span className="text-xs text-slate-500 font-bold w-6 shrink-0">
                  {toPersianDigits(q.id)})
                </span>

                {/* Math Expression formatted strictly LTR */}
                <div dir="ltr" className="flex-1 flex items-center justify-center gap-1.5 text-sm sm:text-base font-black tracking-wide text-slate-900">
                  {q.format === 'standard' && (
                    <>
                      <span>{toPersianDigits(q.f1)}</span>
                      <span className="text-emerald-700 font-black">×</span>
                      <span>{toPersianDigits(q.f2)}</span>
                      <span>=</span>
                      <span className="text-slate-400 font-bold tracking-widest">........</span>
                    </>
                  )}

                  {q.format === 'blank_f1' && (
                    <>
                      <span className="text-slate-400 font-bold tracking-widest">......</span>
                      <span className="text-emerald-700 font-black">×</span>
                      <span>{toPersianDigits(q.f2)}</span>
                      <span>=</span>
                      <span>{toPersianDigits(q.product)}</span>
                    </>
                  )}

                  {q.format === 'blank_f2' && (
                    <>
                      <span>{toPersianDigits(q.f1)}</span>
                      <span className="text-emerald-700 font-black">×</span>
                      <span className="text-slate-400 font-bold tracking-widest">......</span>
                      <span>=</span>
                      <span>{toPersianDigits(q.product)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation Table */}
        {includeEvaluationTable && (
          <div className="pt-4 border-t-2 border-slate-900 space-y-2">
            <div className="text-[11px] font-black text-slate-800">
              📊 جدول ارزیابی توصیفی آموزگار / ولی:
            </div>
            <table className="w-full border-collapse border border-slate-900 text-center text-xs font-black">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900">
                  <th className="border-r border-slate-900 p-1.5">خیلی خوب 🌟</th>
                  <th className="border-r border-slate-900 p-1.5">خوب 👍</th>
                  <th className="border-r border-slate-900 p-1.5">قابل قبول 👌</th>
                  <th className="p-1.5">نیاز به آموزش و تلاش بیشتر 🔁</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-9">
                  <td className="border-r border-slate-900"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="border-r border-slate-900"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold pt-1">
              <span>امضای آموزگار / ولی: .......................................</span>
              <span>تاریخ بررسی: .......................................</span>
            </div>
          </div>
        )}

        {/* Answer Key (Optional at bottom of page) */}
        {includeAnswerKey && (
          <div className="pt-4 border-t border-dashed border-slate-400 space-y-1.5 text-slate-700">
            <div className="text-[10px] font-black text-slate-500">
              🔑 کلید پاسخ‌نامه (جهت تصحیح سریع):
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-[10px] font-bold bg-slate-50 p-2 rounded-lg border border-slate-200">
              {questions.map((q) => {
                let ans = q.product;
                if (q.format === 'blank_f1') ans = q.f1;
                if (q.format === 'blank_f2') ans = q.f2;

                return (
                  <div key={`ans-${q.id}`} className="text-center">
                    <span className="text-slate-400">{toPersianDigits(q.id)}:</span>{' '}
                    <span className="font-black text-slate-900">{toPersianDigits(ans)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Brand */}
        <div className="text-center text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-100">
          تولید شده توسط ضربیار؛ یادگیری شیرین جدول ضرب با بازی و تمرین ❤️
        </div>

      </div>

    </div>
  );
};
