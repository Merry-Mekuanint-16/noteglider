"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "~/lib/utils";

const EXAMPLES = [
  {
    id: "academic",
    label: "Academic Essay",
    aiText: "Ultimately, creativity is more than a skill; it is a mindset that fosters growth, adaptability, and originality. By nurturing curiosity, embracing experimentation, and collaborating with others, individuals can unlock their creative potential. Creativity enriches life by providing new ways to express ideas, solve problems, and connect with others.",
    humanizedText: "All in all, creativity is not just a recipe; but it is rather an approach to get people growing. The Three Foci of Creativity: Nurturing curiosity, embracing experimentation with hands on learning experience in order to explore other and in collaboration with other innovation warriors. If you're an individual with creativity, it not only makes your life more colorful and fulfilling but can also create better solutions for old problems.",
    aiScore: 100,
    humanScore: 0,
  },
  {
    id: "email",
    label: "Cold Email",
    aiText: "I hope you're doing well and having a smooth, productive day. I wanted to reach out because I've been exploring new ways to help individuals simplify their digital workload and create a more effortless, efficient workflow experience.",
    humanizedText: "I hope you are doing well, and having a good and productive day. I'm writing because I've been experimenting with new ways to help people reduce the amount of digital weight in their lives and focus on a more effortless way of moving through work.",
    aiScore: 100,
    humanScore: 0,
  },
  {
    id: "blog",
    label: "Blog Post",
    aiText: "Early Earth was extremely hot and covered in molten rock. Over time, its surface cooled, forming a solid crust and oceans. Volcanic activity released gases that formed the early atmosphere. Simple life is believed to have appeared around 3.5 billion years ago.",
    humanizedText: "The early Earth was red hot and bathed in molten rock. It gradually cooled on the surface, and a solid crust and oceans formed. Gasses were released through volcanic activity to make the early atmosphere. Primitive life is thought to have evolved rapidly, perhaps as much 3.5 billion years ago.",
    aiScore: 100,
    humanScore: 0,
  },
];

export default function ComparisonSection() {
  const [activeExample, setActiveExample] = useState(0);
  const [viewMode, setViewMode] = useState<"split" | "compare">("split");

  return (
    <section 
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        backgroundColor: 'white'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-[#22c55e]/10 px-4 py-2 text-sm font-bold text-[#22c55e] mb-4">
            See the Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f1f0f] tracking-tight mb-4">
            The Only Humanizer That Passes All Detectors
          </h2>
          <p className="text-base text-gray-500">
            See how <span className="font-bold text-[#22c55e]">FilterNote</span> transforms AI text into natural, undetectable writing.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-gray-100 rounded-full border border-gray-200">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setActiveExample(idx)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
                  activeExample === idx
                    ? "bg-white text-[#0f1f0f] shadow-sm"
                    : "text-gray-500 hover:text-[#0f1f0f]"
                )}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* AI Side */}
            <motion.div
              key={`ai-${activeExample}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="group relative overflow-hidden rounded-3xl border-2 border-red-200 bg-white p-6 sm:p-8 hover:border-red-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <X className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-[#0f1f0f]">Before (AI)</span>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">
                  {EXAMPLES[activeExample]?.aiScore}% AI Detected
                </span>
              </div>
              
              <div className={cn(
                "relative transition-all duration-500 overflow-y-auto",
                viewMode === "split" ? "max-h-[140px]" : "max-h-[400px]"
              )}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`ai-text-${activeExample}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-600 leading-relaxed text-base italic"
                  >
                    "{EXAMPLES[activeExample]?.aiText}"
                  </motion.p>
                </AnimatePresence>
                
                {viewMode === "split" && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>

              <button 
                onClick={() => setViewMode(prev => prev === "split" ? "compare" : "split")}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                {viewMode === "split" ? "Read full text" : "Show less"} 
                <ArrowRight className={cn("h-3 w-3 transition-transform", viewMode === "compare" && "rotate-180")} />
              </button>
            </motion.div>

            {/* Humanized Side */}
            <motion.div
              key={`human-${activeExample}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl border-2 border-[#22c55e]/30 bg-white p-6 sm:p-8 hover:border-[#22c55e] hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-[#0f1f0f]">After (Humanized)</span>
                </div>
                <span className="text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full">
                  100% Human Score
                </span>
              </div>
              
              <div className={cn(
                "relative transition-all duration-500 overflow-y-auto",
                viewMode === "split" ? "max-h-[140px]" : "max-h-[400px]"
              )}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`human-text-${activeExample}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[#0f1f0f] leading-relaxed text-base font-medium"
                  >
                    "{EXAMPLES[activeExample]?.humanizedText}"
                  </motion.p>
                </AnimatePresence>

                {viewMode === "split" && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>

              <button 
                onClick={() => setViewMode(prev => prev === "split" ? "compare" : "split")}
                className="mt-4 text-xs font-bold text-[#22c55e] hover:text-[#16a34a] flex items-center gap-1 transition-colors"
              >
                {viewMode === "split" ? "Read full text" : "Show less"} 
                <ArrowRight className={cn("h-3 w-3 transition-transform", viewMode === "compare" && "rotate-180")} />
              </button>
            </motion.div>
          </div>

          {/* Mobile hint */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 md:hidden">
            <RefreshCw className="h-3 w-3" />
            <span>Tap tabs to switch examples</span>
          </div>
        </div>
      </div>
    </section>
  );
}
