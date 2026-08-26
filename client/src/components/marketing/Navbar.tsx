'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Menu, X, ExternalLink, LogIn, LayoutDashboard } from 'lucide-react';
import { RevoraLogo } from '@/components/ui/RevoraLogo';
import { useAuth } from '@/context/AuthContext';

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, openLoginModal, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchConsole = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      openLoginModal();
    }
  };

  const handleSignIn = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      openLoginModal();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs'
          : 'bg-transparent border-b border-slate-200/50'
      }`}
    >
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <RevoraLogo size="sm" showWordmark tagline="NPCI AutoPay Guardian" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#compliance" className="hover:text-indigo-600 transition-colors">
              NPCI OC-136
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <span>API Docs</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                size="sm"
                onClick={handleLaunchConsole}
                className="text-xs font-bold gap-1.5 shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Console ({user?.name?.split(' ')[0] || 'Merchant'})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignIn}
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  id="navbar-launch-console-btn"
                  onClick={handleLaunchConsole}
                  className="text-xs font-bold gap-1.5 shadow-sm"
                >
                  <span>Launch Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            Features
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            NPCI Compliance
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            FAQ
          </a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={handleLaunchConsole} className="w-full text-xs font-bold gap-1.5 shadow-sm">
                <span>Go to Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleSignIn} className="w-full text-xs font-bold">
                  Sign In
                </Button>
                <Button onClick={handleLaunchConsole} className="w-full text-xs font-bold gap-1.5 shadow-sm">
                  <span>Launch Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

