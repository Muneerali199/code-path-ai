import { lazy, Suspense } from 'react';
import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';

// Below-the-fold sections — lazy loaded so they don't block initial paint
const Workspace = lazy(() => import('./sections/Workspace').then(m => ({ default: m.Workspace })));
const DualAI = lazy(() => import('./sections/DualAI').then(m => ({ default: m.DualAI })));
const Integrations = lazy(() => import('./sections/Integrations').then(m => ({ default: m.Integrations })));
const Documentation = lazy(() => import('./sections/Documentation').then(m => ({ default: m.Documentation })));
const VSCodeExtension = lazy(() => import('./sections/VSCodeExtension').then(m => ({ default: m.VSCodeExtension })));
const MultiIDESupport = lazy(() => import('./sections/MultiIDESupport').then(m => ({ default: m.MultiIDESupport })));
const FeatureGrid = lazy(() => import('./sections/FeatureGrid').then(m => ({ default: m.FeatureGrid })));
const Stats = lazy(() => import('./sections/Stats').then(m => ({ default: m.Stats })));
const Pricing = lazy(() => import('./sections/Pricing').then(m => ({ default: m.Pricing })));
const FAQ = lazy(() => import('./sections/FAQ').then(m => ({ default: m.FAQ })));
const CTA = lazy(() => import('./sections/CTA').then(m => ({ default: m.CTA })));
const StickyScroll = lazy(() => import('./sections/StickyScroll'));
const Footer = lazy(() => import('./sections/Footer').then(m => ({ default: m.Footer })));
const ParticleBackground = lazy(() => import('./components/ParticleBackground').then(m => ({ default: m.ParticleBackground })));

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="min-h-screen" />}>
        <Workspace />
        <DualAI />
        <Integrations />
        <Documentation />
        <VSCodeExtension />
        <MultiIDESupport />
        <FeatureGrid />
        <Stats />
        <Pricing />
        <FAQ />
        <CTA />
        <StickyScroll />
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;