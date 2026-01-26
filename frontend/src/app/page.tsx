'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationScene } from '@/components/presentation/PresentationScene';
import { Loader, KeyboardControls } from '@react-three/drei';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/landing';
import { AnimatePresence } from 'framer-motion';

// Slide Config
const TOTAL_SLIDES = 23;

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Auth Logic
  const router = useRouter();
  const { user, checkSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleLaunch = async () => {
    // Check session
    await checkSession();
    
    if (user) {
      if (user.comType === 'B') {
        router.push('/home');
      } else {
        router.push('/vendor');
      }
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const closeModal = () => setIsAuthModalOpen(false);

  // 1. Restore from SessionStorage on Mount
  useEffect(() => {
    const savedSlide = sessionStorage.getItem('presentation_slide_index');
    if (savedSlide) {
      setCurrentSlide(parseInt(savedSlide, 10));
    }
    setIsLoaded(true);
  }, []);

  // 2. Save to SessionStorage on Change
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('presentation_slide_index', currentSlide.toString());
    }
  }, [currentSlide, isLoaded]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 모달이 열려 있으면 키보드 네비게이션 비활성화
      if (isAuthModalOpen) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="relative w-full h-screen bg-[#f5f5f5] overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows flat camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={['#f5f5f5']} />
            <Suspense fallback={null}>
                <PresentationScene currentSlide={currentSlide} />
            </Suspense>
        </Canvas>
      </div>

      {/* R3F Default Loader */}
      <Loader 
        containerStyles={{ background: '#f5f5f5' }} 
        innerStyles={{ background: '#e0e7ff', width: '200px', height: '4px' }} 
        barStyles={{ background: '#4f46e5', height: '100%' }}
        dataInterpolation={(p) => `Loading Presentation ${p.toFixed(0)}%`} 
        initialState={(active) => active}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        {/* Header */}
        <div className="flex justify-between items-center pointer-events-auto">
            <button 
                onClick={handleLaunch}
                className="flex items-center gap-2 text-slate-500 group"
            >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Launch FABRIO</span>
            </button>
            <button 
                onClick={() => setCurrentSlide(0)}
                className="px-4 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/60 text-slate-600 text-sm font-semibold transition-colors hover:bg-white/80 cursor-pointer"
            >
                KOSA JAVA Final Project
            </button>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-auto">
            <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-3 rounded-full bg-white/20 hover:bg-white/80 backdrop-blur-sm transition-all disabled:opacity-0 text-slate-700"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
        </div>
        
        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-auto">
            <button 
                onClick={nextSlide}
                disabled={currentSlide === TOTAL_SLIDES - 1}
                className="p-3 rounded-full bg-white/20 hover:bg-white/80 backdrop-blur-sm transition-all disabled:opacity-0 text-slate-700"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>

        {/* Footer / Progress */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
            {/* Progress Bar */}
            <div className="w-64 h-1 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                    className="h-full bg-slate-400 transition-all duration-500 ease-out"
                    style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
                />
            </div>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            mode={authMode}
            onClose={closeModal}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
