import React from 'react';
import { toPersianDigits } from '../utils/persian';

interface MathExpressionProps {
  expression: string;
  className?: string;
  size?: 'normal' | 'large' | 'display';
  color?: string;
  symbolColor?: string;
}

/**
 * MathExpression renders arbitrary math equations (e.g. "4 + 4 + 4 = 12", "3 × 4 = 12")
 * with bulletproof Left-to-Right layout rendering.
 * 
 * It tokenizes the expression and renders each token as an independent DOM node in an LTR flex layout.
 * This physically prevents browsers from misordering operators or digits due to RTL inheritance.
 */
export const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  className = '',
  size = 'normal',
  color = 'text-slate-900',
  symbolColor = 'text-amber-500',
}) => {
  const normalized = expression.replace(/ضربدر/g, '×');
  // Tokenize the expression into: numbers (Persian or English), operators, and other symbols
  const tokens = normalized.match(/[0-9۰-۹]+|[\+×\*=\-÷→↓←]|\S+/g) || [];

  let sizeClass = 'typo-math';
  if (size === 'large') sizeClass = 'typo-math-large';
  if (size === 'display') sizeClass = 'typo-display';

  // Check if expression is long to apply subtle responsive size reduction (Rules 7, 10)
  const isLong = tokens.length > 8;
  const longExpressionClass = isLong ? 'text-[0.85em] sm:text-[1em] leading-relaxed' : '';

  return (
    <span
      dir="ltr"
      className={`math-expression inline-flex flex-row flex-wrap items-center justify-center gap-x-1 sm:gap-x-1.5 gap-y-1 sm:gap-y-1.5 max-w-full font-black dir-ltr select-none ${sizeClass} ${longExpressionClass} ${color} ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      {tokens.map((token, index) => {
        const isOperator = /[\+×\*=\-÷→↓←]/.test(token);
        let tokenContent = token;
        
        if (token === '*') tokenContent = '×';

        if (isOperator) {
          let opColor = symbolColor;
          if (tokenContent === '=') opColor = 'text-slate-400 opacity-90';
          if (tokenContent === '→' || tokenContent === '↓' || tokenContent === '←') opColor = 'text-purple-500';
          
          return (
            <span 
              key={index} 
              className={`${opColor} mx-0.5 select-none font-bold`} 
              style={{ display: 'inline-block' }}
            >
              {tokenContent}
            </span>
          );
        }

        // Format english numbers to persian if found
        const formattedToken = /^[0-9]+$/.test(token) ? toPersianDigits(Number(token)) : token;

        return (
          <span 
            key={index} 
            className="select-none" 
            style={{ display: 'inline-block' }}
          >
            {formattedToken}
          </span>
        );
      })}
    </span>
  );
};
