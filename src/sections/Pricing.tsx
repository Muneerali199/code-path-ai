import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Zap, Crown, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    color: 'from-gray-500 to-gray-600',
    features: [
      '100 AI requests/month',
      'Basic code generation',
      'Error explanations',
      'Community support',
      'VS Code extension',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: '$19',
    period: 'per month',
    description: 'For serious developers',
    color: 'from-neon-green to-neon-dark',
    features: [
      'Unlimited AI requests',
      'Advanced code generation',
      'Project templates',
      'Priority support',
      'All IDE extensions',
      'Custom AI training',
      'Team collaboration',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: 'Custom',
    period: 'pricing',
    description: 'For teams and organizations',
    color: 'from-purple-neon to-pink-neon',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'Audit logs',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const Pricing = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.pricing-title',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Pricing cards
      gsap.fromTo(
        '.pricing-card',
        { y: 80, opacity: 0, rotateX: 30 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.15,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
            <Crown className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-neon-green">PRICING</span>
          </div>
          <h2 className="pricing-title font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more power
          </p>
        </div>

        {/* Pricing Cards */}
        <div 
          className="grid md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
          style={{ perspective: '1000px' }}
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isHovered = hoveredPlan === index;
            
            return (
              <div
                key={plan.name}
                className={`pricing-card relative rounded-3xl overflow-hidden transition-all duration-500 ${
                  plan.popular 
                    ? 'md:-mt-4 md:mb-4' 
                    : ''
                }`}
                style={{ transformStyle: 'preserve-3d' }}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-neon-green to-neon-dark text-black text-center text-sm font-display font-semibold z-10">
                    Most Popular
                  </div>
                )}

                <div 
                  className={`relative h-full p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border ${
                    plan.popular
                      ? 'bg-dark-card border-neon-green/50'
                      : 'bg-dark-card border-gray-800'
                  } ${isHovered ? 'border-neon-green/50' : ''} transition-all duration-500`}
                >
                  {/* Glow Effect */}
                  <div 
                    className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-opacity duration-500 ${
                      isHovered ? 'opacity-30' : 'opacity-10'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${plan.color.includes('neon-green') ? '#00ff88' : plan.color.includes('purple') ? '#a855f7' : '#666'}, transparent)`,
                    }}
                  />

                  {/* Icon */}
                  <div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="font-display font-bold text-2xl text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="font-display font-bold text-4xl text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm ml-2">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? 'bg-neon-green/20' : 'bg-gray-800'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-neon-green' : 'text-gray-500'}`} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button 
                    className={`w-full py-4 rounded-xl font-display font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'btn-neon'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: '14-day', label: 'Free Trial' },
            { value: 'No', label: 'Credit Card Required' },
            { value: 'Cancel', label: 'Anytime' },
          ].map((item) => (
            <div key={item.label}>
              <div className="font-display font-semibold text-white">{item.value}</div>
              <div className="text-gray-500 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
