"use client";

import { Brain, Sparkles, Scan, FileSearch, Zap } from "lucide-react";

export default function FactsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* Left Side - System Card */}
          <div className="relative w-full">
            <div className="relative h-full rounded-3xl border-2 border-gray-200 bg-gray-50 p-6 sm:p-8 overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                {/* Header with large stat */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-3">
                    <div className="text-5xl sm:text-6xl font-black text-[#22c55e]">
                      2.5M+
                    </div>
                    <div className="text-base font-bold text-gray-500">samples</div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Our system is trained on over 2.5 million samples of academic writing, essays, research papers, and AI-generated text to deliver unparalleled humanization results.
                  </p>
                </div>

                {/* System Process Steps */}
                <div className="space-y-4 flex-1">
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-bold text-[#0f1f0f] mb-4 flex items-center gap-2">
                      <Scan className="h-4 w-4 text-[#22c55e]" />
                      How Our System Works
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                            <FileSearch className="h-4 w-4 text-[#22c55e]" />
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-sm font-bold text-[#0f1f0f] mb-1">Input Text Analysis</h4>
                          <p className="text-xs leading-relaxed text-gray-500">
                            Scans your text to identify patterns and structures that trigger AI detection.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                            <Brain className="h-4 w-4 text-[#22c55e]" />
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-sm font-bold text-[#0f1f0f] mb-1">Pattern Detection</h4>
                          <p className="text-xs leading-relaxed text-gray-500">
                            Analyzes syntax, tone, and word patterns commonly flagged by detection systems.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                            <Zap className="h-4 w-4 text-[#22c55e]" />
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-sm font-bold text-[#0f1f0f] mb-1">Intelligent Rewriting</h4>
                          <p className="text-xs leading-relaxed text-gray-500">
                            Rewrites content with human-like variations that bypass detection while preserving meaning.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-center space-y-5 w-full">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#0f1f0f] sm:text-4xl lg:text-5xl mb-4">
                Where AI Meets<br />
                <span className="text-[#22c55e]">Human Authenticity</span>
              </h2>
              <p className="text-base leading-relaxed text-gray-500">
                FilterNote transforms AI-generated content into natural, undetectable writing using advanced linguistic modeling.
              </p>
            </div>

            {/* Key Points */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e]/10 group-hover:bg-[#22c55e] transition-all duration-300 border border-[#22c55e]/20 group-hover:border-transparent">
                    <Brain className="h-5 w-5 text-[#22c55e] group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-bold text-[#0f1f0f] mb-1.5">Advanced linguistic modeling</h3>
                  <p className="text-xs leading-relaxed text-gray-500">
                    Analyzes syntax, tone, and patterns to ensure your content passes every detection check.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e]/10 group-hover:bg-[#22c55e] transition-all duration-300 border border-[#22c55e]/20 group-hover:border-transparent">
                    <Sparkles className="h-5 w-5 text-[#22c55e] group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-bold text-[#0f1f0f] mb-1.5">Real-time pattern detection</h3>
                  <p className="text-xs leading-relaxed text-gray-500">
                    Scans your input instantly and adjusts rewrite strategy for optimal results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
