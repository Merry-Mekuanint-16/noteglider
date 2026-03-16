"use client";

import { FileText, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Paste Your Text",
    description: "Paste any content: homework, assignment, or AI-generated draft",
    icon: FileText,
  },
  {
    step: 2,
    title: "Humanize",
    description: "Rewrite your text to sound 100% human-written and pass AI detection",
    icon: CheckCircle2,
  },
];

export default function HowToUseSection() {
  return (
    <section 
      className="py-16 sm:py-20"
      style={{ 
        backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        backgroundColor: 'white'
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-[#22c55e]/10 px-4 py-2 text-sm font-bold text-[#22c55e] mb-4">
            How It Works
          </span>
          <h2 className="text-3xl font-black tracking-tight text-[#0f1f0f] sm:text-4xl lg:text-5xl mb-4">
            Humanize AI Writing in 2 Simple Steps
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Perfect for essays, assignments, blog posts and research papers
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.step} className="relative">
                {/* Arrow connector for desktop */}
                {!isLast && (
                  <div className="hidden md:block absolute top-12 left-full w-full z-0 px-6">
                    <div className="relative h-full flex items-center">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 transform -translate-y-1/2" />
                      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-3 z-10">
                        <div className="rounded-full bg-gray-100 p-1 border border-gray-200">
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Card */}
                <div className="relative h-full bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-[#22c55e] transition-colors duration-200">
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#22c55e] flex items-center justify-center">
                      <span className="text-lg font-black text-white">{step.step}</span>
                    </div>
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Icon className="h-5 w-5 text-[#22c55e]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#0f1f0f]">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
