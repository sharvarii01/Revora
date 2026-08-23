'use client';

import React from 'react';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureShowcase } from '@/components/marketing/FeatureShowcase';
import { ComplianceComparison } from '@/components/marketing/ComplianceComparison';
import { FaqSection } from '@/components/marketing/FaqSection';
import { MarketingFooter } from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <MarketingNavbar />

      {/* Hero Section with Live Teaser */}
      <HeroSection />

      {/* Deep Dive Features */}
      <FeatureShowcase />

      {/* NPCI Zero-Penalty Compliance Matrix */}
      <ComplianceComparison />

      {/* FAQ Accordion */}
      <FaqSection />

      {/* Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
