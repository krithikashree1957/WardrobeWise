import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Splash Screen - ported 1:1 from Stitch export
 * (stitch_wardrobewise_ai_fashion_studio/splash_screen/code.html).
 * Animated gradient background, floating glass logo mark, glass CTA button
 * with shine sweep, and a cursor-follow ambient glow.
 */
export default function Splash() {
  const navigate = useNavigate();
  const glowRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const handleMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.opacity = '1';
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="h-screen w-screen font-body-lg text-on-background overflow-hidden relative">
      {/* Background Layer: Soft Blurred Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-fixed via-secondary-fixed to-surface-container-low animate-drift" />
      {/* Atmospheric Ambient Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-float" />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary-container/30 blur-[120px] rounded-full"
        style={{ animation: 'floating 6s ease-in-out infinite reverse' }}
      />

      <main className="relative h-full flex flex-col items-center justify-between px-container-padding-mobile md:px-container-padding-desktop py-stack-lg max-w-screen-xl mx-auto overflow-hidden">
        <div className="h-16" />

        <div className={`flex flex-col items-center text-center ${ready ? 'animate-entrance' : 'opacity-0'}`}>
          <div className="mb-stack-lg relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative glass-panel w-24 h-24 md:w-32 md:h-32 rounded-lg flex items-center justify-center animate-float">
              <span
                className="material-symbols-outlined text-primary text-[48px] md:text-[64px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                checkroom
              </span>
            </div>
          </div>

          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tighter mb-stack-sm">
            WardrobeWise
          </h1>

          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container/10 border border-secondary/20">
            <span className="font-label-caps text-label-caps text-secondary-fixed-dim uppercase tracking-widest">
              Your AI Fashion Companion
            </span>
          </div>
        </div>

        <div
          className="w-full flex flex-col items-center gap-stack-md pb-stack-lg animate-entrance"
          style={{ animationDelay: '0.3s' }}
        >
          <button
            onClick={() => navigate('/login')}
            className="group relative w-full max-w-sm px-gutter py-stack-md rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(186, 230, 253, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(103, 75, 181, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center justify-center gap-stack-sm relative z-10">
              <span className="font-title-md text-title-md text-primary">Get Started</span>
              <span className="material-symbols-outlined text-primary animate-bounce-x">arrow_forward</span>
            </div>
          </button>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">
            Sign in or create an account
          </p>
        </div>
      </main>

      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2 z-0 opacity-0 transition-opacity duration-700"
      />
    </div>
  );
}
