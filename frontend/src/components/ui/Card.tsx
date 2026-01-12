'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: boolean;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: 'none' | 'subtle' | 'emerald' | 'purple';
  animate?: boolean;
  delay?: number;
}

const gradientClasses = {
  none: 'bg-white',
  subtle: 'bg-gradient-to-br from-white to-stone-50',
  emerald: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50',
  purple: 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50',
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = true,
  className = '',
  hover = false,
  glass = false,
  gradient = 'none',
  animate = true,
  delay = 0,
}) => {
  const Wrapper = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  } : {};

  return (
    <Wrapper
      {...motionProps}
      className={`
        ${gradientClasses[gradient]}
        ${glass ? 'backdrop-blur-xl bg-white/80 border-white/20' : 'border-stone-200'}
        rounded-2xl border shadow-sm
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100/80">
          <div>
            {title && (
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: 3 }}
                  transition={{ delay: delay + 0.2, duration: 0.3 }}
                  className="h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"
                />
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </Wrapper>
  );
};

export default Card;
