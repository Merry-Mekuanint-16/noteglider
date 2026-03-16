"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0f1f0f]">
              FilterNote
            </span>
          </Link>

          <div className="hidden md:flex" />

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              disabled={loading}
              onClick={() => handleNavigation("/")}
              className="cursor-pointer gap-2 rounded-full bg-[#22c55e] px-6 font-bold text-white hover:bg-[#16a34a]"
            >
              {loading ? "Loading..." : "Get Started"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="text-gray-600 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3" />
        </div>
      )}
    </nav>
  );
}
