'use client';

import React, { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';
import DashboardUI from './DashboardUI';

interface HeroProps {
  onGetStarted: () => void;
}

/**
 * 랜딩 페이지 히어로 섹션
 * - 미니멀 디자인 적용
 * - Emerald/Teal 컬러 포인트
 */
const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xPct = clientX / innerWidth - 0.5;
    const yPct = clientY / innerHeight - 0.5;
    
    x.set(xPct * 10); // 움직임 최소화
    y.set(yPct * 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useTransform(mouseYSpring, [-10, 10], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseXSpring, [-10, 10], ["-2deg", "2deg"]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full flex flex-col items-center perspective-2000"
      style={{ perspective: "2000px" }}
    >
      <div className="text-center max-w-4xl mb-20 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600 mb-2"
        >
          <Terminal className="w-3 h-3" />
          <span>2025 Recruitment Season</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.2]"
        >
          KOSA SW기업 채용 연계형<br />
          <span className="text-gray-900">JAVA 개발자 양성과정</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-500 max-w-xl mx-auto font-medium"
        >
          Enterprise Resource Planning System<br/>
          Team 4 Final Project
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center pt-2"
        >
          <motion.button 
            onClick={onGetStarted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-lg font-bold text-lg transition-all shadow-sm hover:shadow-md"
          >
            <span className="font-black tracking-tight text-xl italic">FABRIO</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Dashboard Mockup - Minimal Perspective */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
        className="relative z-20 w-full max-w-5xl px-4"
      >
        <div className="relative rounded-xl bg-white shadow-2xl border border-gray-200/60 overflow-hidden">
            {/* Window Controls */}
            <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            </div>
            
            {/* Dashboard Content */}
            <div className="bg-gray-50/50 p-1">
                <DashboardUI />
            </div>
        </div>
        
        {/* Subtle Shadow Reflection */}
        <div className="absolute -inset-4 bg-gray-200/30 blur-2xl -z-10 rounded-[2rem] transform scale-95 translate-y-4"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
