'use client';

import React, { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import DashboardUI from './DashboardUI';

interface HeroProps {
  onGetStarted: () => void;
}

/**
 * 랜딩 페이지 히어로 섹션
 * - "Purchase ERP" 버튼만 표시
 * - 클릭 시 세션 확인 후 라우팅 또는 로그인 모달 표시
 */
const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xPct = clientX / innerWidth - 0.5;
    const yPct = clientY / innerHeight - 0.5;
    
    x.set(xPct * 20);
    y.set(yPct * 20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useTransform(mouseYSpring, [-10, 10], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-10, 10], ["-5deg", "5deg"]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full flex flex-col items-center perspective-1000"
      style={{ perspective: "1200px" }}
    >
      <div className="text-center max-w-4xl mb-16 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-mono text-indigo-600"
        >
          <Sparkles className="w-3 h-3" />
          <span>2025 Recruitment Season</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 leading-[1.5] pb-2 drop-shadow-md"
        >
          KOSA SW기업 채용 연계형<br />
          <span className="text-indigo-600">JAVA 개발자 양성과정</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Team 4 / Final Project
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center"
        >
          {/* Purchase ERP 버튼만 표시 */}
          <motion.button 
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            Purchase ERP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Dashboard Mockup */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        className="relative z-20 w-full max-w-5xl"
      >
        {/* Glow effect behind dashboard */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] -z-10 rounded-full"></div>
        
        <DashboardUI />
      </motion.div>
    </section>
  );
};

export default Hero;
