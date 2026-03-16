"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { History, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface PageNavbarProps {
  onHistoryClick?: () => void;
  currentCredits?: number;
  isTeamMember?: boolean;
}

export default function PageNavbar({ onHistoryClick, currentCredits, isTeamMember = false }: PageNavbarProps) {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const allNavLinks = isSignedIn 
    ? [...navLinks.slice(0, 2), { href: "/account", label: "Account" }, ...navLinks.slice(2)]
    : navLinks;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="FilterNote" width={32} height={32} className="rounded-lg" />
          <span className="text-2xl font-black tracking-tight text-[#0f1f0f]">FilterNote</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex items-center gap-8">
            {allNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isActive ? "text-[#22c55e]" : "text-gray-600 hover:text-[#22c55e]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {isTeamMember && (
                  <span className="rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-bold text-[#22c55e] border border-[#22c55e]/30">
                    Team
                  </span>
                )}
                {currentCredits !== undefined && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-[#0f1f0f]">
                    {currentCredits} credits
                  </span>
                )}
                {onHistoryClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onHistoryClick}
                    className="gap-2 rounded-full border-2 border-gray-300 font-semibold hover:border-[#22c55e] hover:text-[#22c55e]"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                )}
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-600 font-semibold hover:text-[#22c55e] hover:bg-[#22c55e]/5">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="rounded-full bg-[#22c55e] px-6 text-white font-bold hover:bg-[#16a34a]">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white pb-6 pt-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4">
            {allNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 font-semibold transition hover:bg-gray-100",
                    isActive && "bg-[#22c55e]/10 text-[#22c55e]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {isSignedIn ? (
              <div className="mt-3 flex flex-col gap-3">
                {currentCredits !== undefined && (
                  <div className="rounded-lg bg-gray-100 px-4 py-2 text-center font-bold text-[#0f1f0f]">
                    {currentCredits} credits
                  </div>
                )}
                <div className="flex justify-center pt-1">
                  <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full rounded-lg border-2 border-gray-300 font-semibold">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full rounded-lg bg-[#22c55e] text-white font-bold hover:bg-[#16a34a]">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
