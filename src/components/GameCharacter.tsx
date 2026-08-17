import React from 'react';
import { motion } from 'motion/react';
import { toPersianDigits } from '../utils/persian';

export type CharacterId = 'robot' | 'fox' | 'panda' | 'cat';
export type CharacterExpression = 'idle' | 'correct' | 'wrong' | 'thinking' | 'celebration' | 'cheering';

export interface GameCharacterProps {
  characterId: CharacterId;
  expression?: CharacterExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hat?: string;
  glasses?: string;
  accessory?: string;
  className?: string;
}

export interface CharacterMetadata {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  colorClass: string;
  accentColor: string;
  emoji: string;
}

export const CHARACTERS_METADATA: Record<CharacterId, CharacterMetadata> = {
  robot: {
    id: 'robot',
    name: 'روبو-یار (ربات باهوش) 🤖',
    tagline: 'سریع، دقیق و پر از انرژی دیجیتالی!',
    description: 'عاشق محاسبات فوق‌سریع و فرمول‌های پیشرفته ضرب. آماده است تا با موتورهای توربو خودت رو به قهرمانی برسونه!',
    colorClass: 'from-cyan-400 to-blue-600',
    accentColor: '#06b6d4',
    emoji: '🤖',
  },
  fox: {
    id: 'fox',
    name: 'روبو-فاکس (روباه زرنگ) 🦊',
    tagline: 'استاد ترفندهای ضرب و رازهای جادویی!',
    description: 'کنجکاو و بسیار باهوش. بهت یاد میده چطور با ترفندهای هوشمندانه، سخت‌ترین ضرب‌ها رو توی هوا روی انگشتات حل کنی!',
    colorClass: 'from-orange-400 to-amber-600',
    accentColor: '#f97316',
    emoji: '🦊',
  },
  panda: {
    id: 'panda',
    name: 'پاندا-یار (پاندا متفکر) 🐼',
    tagline: 'باهوش، فیلسوف ریاضی و استاد تمرکز عمیق!',
    description: 'پاندا دانا با عینک قرمز و پاپیون شیک! متفکر، باحوصله و مهربان، بهت کمک می‌کنه با آرامش و تمرکز بالا به تمام جدول ضرب مسلط بشی.',
    colorClass: 'from-rose-500 to-slate-700',
    accentColor: '#e11d48',
    emoji: '🐼',
  },
  cat: {
    id: 'cat',
    name: 'پیشی-یار (گربه پرانرژی) 🐱',
    tagline: 'خوش‌پوش، باهوش و قهرمان چالش‌های سرعتی!',
    description: 'گربه باهوش با هودی زرد پرانرژی! یادگیری ضرب رو به یک ماجراجویی جذاب و سریع تبدیل می‌کنه و همیشه مشوق توئه!',
    colorClass: 'from-amber-400 to-yellow-600',
    accentColor: '#eab308',
    emoji: '🐱',
  },
};

export const GameCharacter: React.FC<GameCharacterProps> = ({
  characterId,
  expression = 'idle',
  size = 'md',
  className = '',
}) => {
  // Compute size in pixels
  const sizeMap = {
    xs: 40,
    sm: 70,
    md: 110,
    lg: 150,
    xl: 200,
    '2xl': 260,
  };
  const pixelSize = sizeMap[size];

  // Base animation variants based on expressions with natural cartoon physics
  const characterVariants = {
    idle: {
      y: [0, -3.5, 0],
      scale: [1, 1.015, 1],
      transition: {
        repeat: Infinity,
        duration: 2.8,
        ease: 'easeInOut',
      },
    },
    correct: {
      y: [0, -18, 0],
      scale: [1, 1.08, 0.98, 1],
      rotate: [0, -4, 4, 0],
      transition: {
        duration: 0.55,
        ease: 'easeOut',
      },
    },
    wrong: {
      x: [0, -6, 6, -4, 4, 0],
      rotate: [0, -3, 3, -2, 2, 0],
      transition: {
        duration: 0.45,
      },
    },
    thinking: {
      rotate: [4, -4, 4],
      y: [0, -3, 0],
      transition: {
        repeat: Infinity,
        duration: 2.2,
        ease: 'easeInOut',
      },
    },
    celebration: {
      y: [0, -16, 0, -10, 0],
      scale: [1, 1.07, 0.96, 1.04, 1],
      rotate: [0, 5, -5, 3, 0],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        ease: 'easeInOut',
      },
    },
    cheering: {
      rotate: [-5, 5, -5],
      y: [0, -5, 0],
      scale: [1, 1.03, 1],
      transition: {
        repeat: Infinity,
        duration: 1.1,
        ease: 'easeInOut',
      },
    },
  };

  // Eyes coordinates and states depending on expression
  const isEyeClosed = expression === 'correct' || expression === 'celebration';
  const isEyeSad = expression === 'wrong';
  const isEyeThinking = expression === 'thinking';

  // Sub-animation variants for specific parts
  const armVariants = {
    idle: { rotate: [0, 5, 0] },
    correct: { rotate: [0, -80, 0], transition: { duration: 0.45 } },
    wrong: { rotate: [0, 15, 0] },
    thinking: { rotate: [-10, -25, -10], transition: { duration: 1, repeat: Infinity } },
    celebration: { rotate: [0, -120, -120, 0], transition: { duration: 0.8 } },
    cheering: { rotate: [-40, -60, -40], transition: { duration: 1, repeat: Infinity } },
  };

  // CHARACTER SPECIFIC SVG GENERATORS
  const renderRobot = () => {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="robo-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="robo-ears-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="robo-belly-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="robo-face-glass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#02040a" />
          </linearGradient>
          <linearGradient id="robo-cheek-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#020617" floodOpacity="0.22" />
          </filter>
        </defs>

        <g filter="url(#soft-shadow)">
          {/* Ground shadow */}
          <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#020617" opacity="0.2" />

          {/* Left Arm / Cyber-Connector */}
          <motion.path
            d="M 14 62 Q 2 64 8 76"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="7.5"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-right"
            style={{ originX: '14px', originY: '62px' }}
          />
          {/* Left Claw */}
          <circle cx="8" cy="76" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Right Arm / Cyber-Connector */}
          <motion.path
            d="M 86 62 Q 98 64 92 76"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="7.5"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-left"
            style={{ originX: '86px', originY: '62px' }}
          />
          {/* Right Claw */}
          <circle cx="92" cy="76" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Body Base Block */}
          <rect x="20" y="52" width="60" height="37" rx="16" fill="url(#robo-body-gradient)" stroke="#0369a1" strokeWidth="2.5" />
          
          {/* Sleek metallic plate highlight */}
          <path d="M 23 55 Q 50 62 77 55" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />

          {/* Digital Smart Screen in stomach */}
          <rect x="30" y="59" width="40" height="23" rx="7" fill="url(#robo-belly-gradient)" stroke="#1e293b" strokeWidth="1.5" />
          {/* Outer blue neon glow around screen */}
          <rect x="29" y="58" width="42" height="25" rx="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.45" />
          
          <motion.g
            animate={isEyeClosed ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {/* Holographic math grid on stomach screen */}
            <line x1="33" y1="70" x2="67" y2="70" stroke="#00f5ff" strokeWidth="0.5" opacity="0.2" />
            <line x1="50" y1="61" x2="50" y2="80" stroke="#00f5ff" strokeWidth="0.5" opacity="0.2" />
            
            <text
              x="50"
              y="75"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="12.5"
              fontWeight="1000"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              {isEyeClosed ? '✓✓✓' : isEyeSad ? '۹×۹=؟' : '۹×۹='}
            </text>
          </motion.g>

          {/* Neck with hydraulic rings */}
          <rect x="40" y="44" width="20" height="12" rx="3.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="43" y1="48" x2="57" y2="48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="43" y1="52" x2="57" y2="52" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Head Group */}
          <motion.g
            animate={expression === 'idle' ? { y: [0, -2.5, 0] } : expression === 'thinking' ? { rotate: [-6, 6, -6] } : {}}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="origin-bottom"
          >
            {/* Side Bolts / Cyber Ears with gold glow */}
            <rect x="12" y="24" width="10" height="16" rx="4" fill="url(#robo-ears-gradient)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="78" y="24" width="10" height="16" rx="4" fill="url(#robo-ears-gradient)" stroke="#78350f" strokeWidth="1.5" />
            
            {/* Glowing signal circles inside bolts */}
            <circle cx="17" cy="32" r="2.5" fill="#ffffff" />
            <circle cx="83" cy="32" r="2.5" fill="#ffffff" />

            {/* Antenna tower */}
            <line x1="50" y1="18" x2="50" y2="6" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="18" x2="50" y2="6" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            
            {/* Glowing Antenna Tip Sphere */}
            <motion.circle
              cx="50"
              cy="4"
              r="6.5"
              fill="#fbbf24"
              stroke="#ca8a04"
              strokeWidth="1.5"
              animate={isEyeClosed ? { scale: [1, 1.5, 1], fill: '#10b981' } : { scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            {/* Mini glow ring around antenna */}
            <circle cx="50" cy="4" r="11" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />

            {/* Helmet Faceplate */}
            <rect x="18" y="16" width="64" height="34" rx="14" fill="url(#robo-body-gradient)" stroke="#0369a1" strokeWidth="2.5" />
            <path d="M 22 19 Q 50 25 78 19" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />

            {/* Dark glass monitor screen face */}
            <rect x="24" y="21" width="52" height="24" rx="10" fill="url(#robo-face-glass)" stroke="#1e293b" strokeWidth="1" />
            {/* Cyan glass visor edge glow */}
            <rect x="23" y="20" width="54" height="26" rx="11" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.45" />

            {/* Glass reflection sheen */}
            <path d="M 25 22 Q 50 28 75 22 Q 50 17 25 22" fill="#ffffff" opacity="0.12" />

            {/* Eyes */}
            {isEyeClosed ? (
              <>
                {/* Cheerful happy cyber arches */}
                <path d="M 30 33 Q 36 27, 42 33" fill="none" stroke="#00f5ff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 58 33 Q 64 27, 70 33" fill="none" stroke="#00f5ff" strokeWidth="3.5" strokeLinecap="round" />
                {/* Glistening star indicators */}
                <path d="M 36 24 L 38 27 L 41 27 L 39 29 L 40 32 L 36 30 L 32 32 L 33 29 L 31 27 L 34 27 Z" fill="#10b981" opacity="0.8" transform="scale(0.5) translate(36, 12)" />
                <path d="M 36 24 L 38 27 L 41 27 L 39 29 L 40 32 L 36 30 L 32 32 L 33 29 L 31 27 L 34 27 Z" fill="#10b981" opacity="0.8" transform="scale(0.5) translate(88, 12)" />
              </>
            ) : isEyeSad ? (
              <>
                {/* Gentle supportive round green-cyan eyes for cheering up (NOT sad) */}
                <circle cx="36" cy="31" r="5.5" fill="#34d399" />
                <circle cx="64" cy="31" r="5.5" fill="#34d399" />
                <circle cx="34.5" cy="29.5" r="1.8" fill="#ffffff" />
                <circle cx="62.5" cy="29.5" r="1.8" fill="#ffffff" />
                <path d="M 30 24 Q 36 21, 42 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 58 24 Q 64 21, 70 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : isEyeThinking ? (
              <>
                {/* Luminous curious eyes looking up/side */}
                <circle cx="38" cy="29" r="5.5" fill="#22d3ee" />
                <circle cx="66" cy="29" r="5.5" fill="#22d3ee" />
                {/* Dual highlights inside pupils */}
                <circle cx="36.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="64.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="39.5" cy="30.5" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="67.5" cy="30.5" r="1" fill="#ffffff" opacity="0.8" />
              </>
            ) : (
              <>
                {/* Beautiful large cybernetic eyes with high detail */}
                <circle cx="36" cy="31" r="5.5" fill="#00f5ff" />
                <circle cx="64" cy="31" r="5.5" fill="#00f5ff" />
                {/* Specular Glare Dots */}
                <circle cx="34" cy="29" r="2" fill="#ffffff" />
                <circle cx="62" cy="29" r="2" fill="#ffffff" />
                <circle cx="38" cy="33" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="66" cy="33" r="1" fill="#ffffff" opacity="0.8" />
                {/* Luminous neon rings */}
                <circle cx="36" cy="31" r="7.5" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
                <circle cx="64" cy="31" r="7.5" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
              </>
            )}

            {/* Mouth */}
            {isEyeSad ? (
              /* Sweet friendly neutral mouth for wrong answer (encouraging smile) */
              <path d="M 44 40 Q 50 43, 56 40" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            ) : (
              /* Broad natural smile */
              <path d="M 43 38 Q 50 44, 57 38" fill="none" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" />
            )}
          </motion.g>

          {/* Futuristic rolling wheels/tank tracks */}
          <rect x="28" y="87" width="15" height="8" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="57" y="87" width="15" height="8" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {/* Luminous track hubs */}
          <circle cx="32" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="40" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="61" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="69" cy="91" r="2.5" fill="#22d3ee" />
        </g>
      </svg>
    );
  };

  const renderFox = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
        {/* Soft realistic floating ground shadow under feet */}
        <div
          className="absolute bottom-0.5 w-[65%] h-3 bg-slate-950/25 rounded-full blur-[3px] pointer-events-none transition-all duration-300"
          style={{
            transform:
              expression === 'correct' || expression === 'celebration'
                ? 'scale(0.65) translateY(6px)'
                : expression === 'cheering'
                ? 'scale(0.8)'
                : 'scale(1)',
            opacity: expression === 'correct' || expression === 'celebration' ? 0.15 : 0.28,
          }}
        />

        {/* 100% Transparent HD 3D Mascot Image with seamless cutout */}
        <img
          src="/fox_transparent.png?v=3"
          alt="روباه باهوش ضربیار"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300"
          style={{
            transform: 'scale(1.02)', // Extra cute and chubby proportion
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/fox.png?v=3';
          }}
        />
      </div>
    );
  };

  const renderPanda = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
        {/* Soft realistic floating ground shadow under feet */}
        <div
          className="absolute bottom-0.5 w-[65%] h-3 bg-slate-950/25 rounded-full blur-[3px] pointer-events-none transition-all duration-300"
          style={{
            transform:
              expression === 'correct' || expression === 'celebration'
                ? 'scale(0.65) translateY(6px)'
                : expression === 'cheering'
                ? 'scale(0.8)'
                : 'scale(1)',
            opacity: expression === 'correct' || expression === 'celebration' ? 0.15 : 0.28,
          }}
        />

        {/* 100% Transparent HD 3D Mascot Image with seamless cutout */}
        <img
          src="/panda_transparent.png?v=3"
          alt="پاندا-یار قهرمان ضربیار"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300"
          style={{
            transform: 'scale(1.02)',
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/panda.png?v=3';
          }}
        />
      </div>
    );
  };

  const renderCat = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
        {/* Soft realistic floating ground shadow under feet */}
        <div
          className="absolute bottom-0.5 w-[65%] h-3 bg-slate-950/25 rounded-full blur-[3px] pointer-events-none transition-all duration-300"
          style={{
            transform:
              expression === 'correct' || expression === 'celebration'
                ? 'scale(0.65) translateY(6px)'
                : expression === 'cheering'
                ? 'scale(0.8)'
                : 'scale(1)',
            opacity: expression === 'correct' || expression === 'celebration' ? 0.15 : 0.28,
          }}
        />

        {/* 100% Transparent HD 3D Mascot Image with seamless cutout */}
        <img
          src="/cat_transparent.png?v=3"
          alt="پیشی-یار قهرمان ضربیار"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300"
          style={{
            transform: 'scale(1.02)',
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/cat.png?v=3';
          }}
        />
      </div>
    );
  };

  const renderCharacterSVG = () => {
    switch (characterId) {
      case 'robot':
        return renderRobot();
      case 'fox':
        return renderFox();
      case 'panda':
        return renderPanda();
      case 'cat':
        return renderCat();
      default:
        return renderRobot();
    }
  };

  // Dynamic Atmospheric and Environmental Particle FX surrounding the character
  const renderSurroundingEffects = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-visible select-none z-20">
        {/* 1. CELEBRATION & CORRECT: Bursting Stars, Confetti, Glowing Energy Ring */}
        {(expression === 'celebration' || expression === 'correct') && (
          <>
            {/* Background radiant aura glow */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.8, 1.25, 0.9],
                opacity: [0.15, 0.45, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-400/30 via-orange-400/20 to-purple-500/25 blur-xl -z-10"
            />

            {/* Orbiting / Rising Golden Stars */}
            {[
              { left: '10%', top: '-22%', delay: 0, text: '⭐', size: 'text-xl' },
              { left: '78%', top: '-25%', delay: 0.18, text: '✨', size: 'text-lg' },
              { left: '46%', top: '-34%', delay: 0.35, text: '🌟', size: 'text-2xl' },
              { left: '-8%', top: '22%', delay: 0.25, text: '✨', size: 'text-base' },
              { left: '92%', top: '24%', delay: 0.4, text: '⭐', size: 'text-lg' },
              { left: '20%', top: '-10%', delay: 0.5, text: '✦', size: 'text-amber-300 font-black text-xl' },
              { left: '72%', top: '-10%', delay: 0.6, text: '✦', size: 'text-amber-300 font-black text-xl' },
            ].map((star, idx) => (
              <motion.span
                key={`star-${idx}`}
                initial={{ opacity: 0, scale: 0, y: 15 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.4, 1.25, 1, 0],
                  y: [-5, -28, -42],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  delay: star.delay,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: 'easeOut',
                }}
                className={`absolute select-none ${star.size} filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]`}
                style={{ left: star.left, top: star.top }}
              >
                {star.text}
              </motion.span>
            ))}

            {/* Confetti Ribbon Streamers for Celebration */}
            {expression === 'celebration' && (
              <>
                {[
                  { left: '5%', top: '-15%', color: 'bg-rose-500', delay: 0.1 },
                  { left: '85%', top: '-18%', color: 'bg-indigo-500', delay: 0.3 },
                  { left: '28%', top: '-30%', color: 'bg-emerald-400', delay: 0.2 },
                  { left: '68%', top: '-28%', color: 'bg-amber-400', delay: 0.45 },
                  { left: '-5%', top: '40%', color: 'bg-purple-500', delay: 0.15 },
                  { left: '95%', top: '42%', color: 'bg-pink-400', delay: 0.35 },
                ].map((confetti, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0.8, 0],
                      scale: [0, 1, 0.9, 0],
                      y: [-10, -32, -45],
                      x: [0, i % 2 === 0 ? -12 : 12],
                      rotate: [0, i % 2 === 0 ? 360 : -360],
                    }}
                    transition={{
                      duration: 1.8,
                      delay: confetti.delay,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                    }}
                    className={`absolute w-2 h-3.5 rounded-sm ${confetti.color} shadow-sm`}
                    style={{ left: confetti.left, top: confetti.top }}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* 2. CHEERING: Floating Music Notes, Sparkles & Hearts */}
        {expression === 'cheering' && (
          <>
            {[
              { left: '-12%', top: '5%', text: '🎵', delay: 0, color: 'text-indigo-500' },
              { left: '94%', top: '2%', text: '🎶', delay: 0.3, color: 'text-purple-500' },
              { left: '82%', top: '-25%', text: '💖', delay: 0.6, color: 'text-pink-500' },
              { left: '8%', top: '-24%', text: '✨', delay: 0.45, color: 'text-amber-400' },
              { left: '46%', top: '-30%', text: '🌟', delay: 0.7, color: 'text-amber-400' },
            ].map((item, idx) => (
              <motion.span
                key={`cheer-${idx}`}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-2, -24, -38],
                  x: [0, idx % 2 === 0 ? -8 : 8, 0],
                  scale: [0.6, 1.2, 0.8],
                  rotate: idx % 2 === 0 ? [-5, 15, -5] : [5, -15, 5],
                }}
                transition={{
                  duration: 2,
                  delay: item.delay,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  ease: 'easeInOut',
                }}
                className={`absolute select-none text-xl ${item.color} font-bold drop-shadow-sm`}
                style={{ left: item.left, top: item.top }}
              >
                {item.text}
              </motion.span>
            ))}
          </>
        )}

        {/* 3. THINKING: Glowing Idea Bulb & Floating Math Orbiters */}
        {expression === 'thinking' && (
          <>
            {/* Glowing Idea Lightbulb with Floating Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{
                opacity: [0.85, 1, 0.85],
                scale: [0.95, 1.12, 0.95],
                y: [0, -6, 0],
                rotate: [-4, 6, -4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-10 left-[62%] bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_18px_rgba(251,191,36,0.85)] border-2 border-white text-base select-none"
            >
              💡
            </motion.div>

            {/* Floating Thinking Clouds and Math Symbols */}
            {[
              { left: '50%', top: '-28%', text: '✖️', delay: 0, size: 'text-amber-500 font-extrabold text-sm' },
              { left: '16%', top: '-22%', text: '❓', delay: 0.4, size: 'text-purple-500 font-black text-lg' },
              { left: '-10%', top: '15%', text: '➗', delay: 0.8, size: 'text-blue-500 font-extrabold text-sm' },
              { left: '88%', top: '22%', text: '➕', delay: 0.6, size: 'text-emerald-500 font-extrabold text-sm' },
            ].map((mathItem, idx) => (
              <motion.span
                key={`math-${idx}`}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{
                  opacity: [0.3, 0.9, 0.3],
                  y: [0, -12, 0],
                  scale: [0.8, 1.1, 0.8],
                  rotate: [0, 20, 0],
                }}
                transition={{
                  duration: 2.4,
                  delay: mathItem.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute select-none ${mathItem.size} drop-shadow-sm`}
                style={{ left: mathItem.left, top: mathItem.top }}
              >
                {mathItem.text}
              </motion.span>
            ))}
          </>
        )}

        {/* 4. WRONG / PUZZLED: Supportive Blue Sweat Drops */}
        {expression === 'wrong' && (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0, y: -5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.2, 0.9],
                y: [0, 12, 22],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: 'easeIn',
              }}
              className="absolute right-0 top-3 text-cyan-500 text-xl font-bold select-none drop-shadow-sm"
            >
              💧
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
              className="absolute left-2 top-2 text-amber-400 text-base select-none"
            >
              💫
            </motion.span>
          </>
        )}

        {/* 5. IDLE: Subtle gentle magical ambient dust sparkles */}
        {expression === 'idle' && (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.75, 0],
                scale: [0.5, 1, 0.4],
                y: [0, -14],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
              className="absolute text-amber-400/80 text-xs font-bold -top-3 right-3 select-none"
            >
              ✦
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.65, 0],
                scale: [0.4, 0.9, 0.3],
                y: [0, -12],
              }}
              transition={{
                duration: 3.2,
                delay: 1.5,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: 'easeInOut',
              }}
              className="absolute text-purple-400/70 text-xs font-bold -top-1 left-2 select-none"
            >
              ✦
            </motion.span>
          </>
        )}
      </div>
    );
  };

  return (
    <motion.div
      variants={characterVariants}
      animate={expression}
      initial="idle"
      className={`relative inline-block select-none origin-bottom ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {renderSurroundingEffects()}
      {renderCharacterSVG()}
    </motion.div>
  );
};
