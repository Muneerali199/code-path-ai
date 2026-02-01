import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Workspace } from './sections/Workspace';
import { DualAI } from './sections/DualAI';
import { Integrations } from './sections/Integrations';
import { Documentation } from './sections/Documentation';
import { VSCodeExtension } from './sections/VSCodeExtension';
import { MultiIDESupport } from './sections/MultiIDESupport';
import { FeatureGrid } from './sections/FeatureGrid';
import { Stats } from './sections/Stats';
import { Pricing } from './sections/Pricing';
import { FAQ } from './sections/FAQ';
import { CTA } from './sections/CTA';
import StickyScroll from './sections/StickyScroll';
import { Footer } from './sections/Footer';
import { ParticleBackground } from './components/ParticleBackground';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ParticleBackground />
      <Navbar />
      <Hero />
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
    </div>
  );
};

export default LandingPage;