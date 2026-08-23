'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface RevoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'solid' | 'glass' | 'white' | 'glow';
  className?: string;
  showWordmark?: boolean;
  tagline?: string;
  animated?: boolean;
}

export function RevoraLogo({
  size = 'md',
  variant = 'solid',
  className,
  showWordmark = false,
  tagline,
  animated = true,
}: RevoraLogoProps) {
  const sizeMap = {
    xs: { box: 'h-7 w-7', text: 'text-sm', badge: 'text-[9px]' },
    sm: { box: 'h-9 w-9', text: 'text-base', badge: 'text-[10px]' },
    md: { box: 'h-11 w-11', text: 'text-lg', badge: 'text-xs' },
    lg: { box: 'h-13 w-13', text: 'text-xl', badge: 'text-xs' },
    xl: { box: 'h-16 w-16', text: 'text-2xl', badge: 'text-xs' },
    '2xl': { box: 'h-20 w-20', text: 'text-3xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const bgStyles = {
    solid: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 shadow-md shadow-indigo-500/20 border border-indigo-400/25',
    glass: 'bg-white/15 backdrop-blur-md border border-white/25 shadow-lg shadow-black/5',
    white: 'bg-white shadow-md border border-slate-100',
    glow: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl shadow-indigo-500/30 border border-indigo-500/30',
  };

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Emblem Icon */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-2xl shrink-0 transition-all duration-300 group-hover:scale-105 overflow-hidden',
          currentSize.box,
          bgStyles[variant]
        )}
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-purple-500/30 opacity-70 pointer-events-none" />

        {/* Vector SVG Mark */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            'w-3/4 h-3/4 relative z-10 drop-shadow-sm',
            animated && 'transition-transform duration-300 group-hover:rotate-1'
          )}
        >
          <defs>
            {/* Ribbon Gradient A: Left Pillar with upward energetic flow */}
            <linearGradient id="revoraStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            {/* Ribbon Gradient B: Loop and sweeping recovered upward stroke */}
            <linearGradient id="revoraLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#C7D2FE" />
              <stop offset="75%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Dynamic Recovery Surge Diagonal (Upward & Forward vector cutting through) */}
            <linearGradient id="revoraSurgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* AI Spark Glow Filter */}
            <filter id="revoraGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Vertical Pillar (Solid architectural spine) */}
          <rect
            x="20"
            y="22"
            width="14"
            height="56"
            rx="7"
            fill="url(#revoraStemGrad)"
          />

          {/* Upper Curved Loop (Infinity-style fluid curve) */}
          <path
            d="M27 22 H54 C66 22 76 31 76 43 C76 55 66 63 54 63 H34"
            stroke="url(#revoraLoopGrad)"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dynamic Recovery Surge Diagonal (Upward & Forward vector cutting through) */}
          <path
            d="M44 52 L69 77 C72 80 77 78 77 73 L77 62"
            stroke="url(#revoraSurgeGrad)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central AI Pulse Intelligence Node */}
          <circle
            cx="49"
            cy="42.5"
            r="4.5"
            fill="#FFFFFF"
            filter="url(#revoraGlow)"
          />
          <circle
            cx="49"
            cy="42.5"
            r="2"
            fill="#6366F1"
          />
        </svg>

        {/* Top-right corner gloss highlight */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-sm pointer-events-none" />
      </div>

      {/* Optional Full Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={cn('font-black tracking-tight text-slate-900 leading-none', currentSize.text)}>
              Revora
            </span>
            <span
              className={cn(
                'font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider',
                currentSize.badge
              )}
            >
              AI
            </span>
          </div>
          {tagline && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-none">{tagline}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RevoraLogo;
