"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div 
      className="h-screen relative overflow-hidden bg-white flex items-center justify-center px-4"
      style={{ 
        backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}
    >
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-xl text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-[#22c55e] leading-none">
            404
          </h1>
        </div>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <span className="text-4xl font-black text-[#0f1f0f]">FilterNote</span>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1f0f] mb-3">
            Page Not Found
          </h2>
          <p className="text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/">
            <Button
              size="lg"
              className="rounded-full bg-[#22c55e] px-8 py-4 text-base font-bold text-white hover:bg-[#16a34a] transition-all"
            >
              Go to Homepage
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-base font-bold text-[#0f1f0f] hover:border-[#22c55e] hover:text-[#22c55e] transition-all"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              href="/pricing" 
              className="text-gray-500 hover:text-[#22c55e] font-semibold transition-colors"
            >
              Pricing
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/contact" 
              className="text-gray-500 hover:text-[#22c55e] font-semibold transition-colors"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/faq" 
              className="text-gray-500 hover:text-[#22c55e] font-semibold transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
