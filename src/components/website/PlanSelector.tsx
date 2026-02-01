import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, CheckCircle2 } from 'lucide-react';

interface Plan {
  id: 'A' | 'B';
  title: string;
  description: string;
  features: string[];
  tech: string[];
}

interface PlanSelectorProps {
  plans: Plan[];
  onSelectPlan: (planId: 'A' | 'B') => void;
}

export default function PlanSelector({ plans, onSelectPlan }: PlanSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">AI Generated Plans</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Choose Your Implementation Plan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400"
        >
          Select the approach that best fits your requirements
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group cursor-pointer"
            onClick={() => onSelectPlan(plan.id)}
          >
            <div className="relative bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all h-full">
              {/* Plan Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs font-semibold">Plan {plan.id}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 pr-20">{plan.title}</h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Tech Stack:</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 rounded-xl pointer-events-none transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-500 text-sm mt-6"
      >
        Click on any plan to start building your website
      </motion.p>
    </motion.div>
  );
}
