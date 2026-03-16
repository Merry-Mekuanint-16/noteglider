"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { History, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

interface ModernNavbarProps {
  onHistoryClick?: () => void;
  currentCredits?: number;
  isTeamMember?: boolean;
}

export default function ModernNavbar({ onHistoryClick, currentCredits, isTeamMember = false }: ModernNavbarProps) {
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
    <nav className="sticky top-0 z-50 w-full bg-white border-b-4 border-black shadow-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transform hover:scale-105 transition-transform">
          <div className="relative">
            <Image src="/logo.png" alt="FilterNote" width={40} height={40} className="rounded-xl border-2 border-black" />
          </div>
          <span className="text-2xl font-black tracking-tight text-black">
            FilterNote
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex items-center gap-6">
            {allNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-bold transition-all transform hover:scale-110",
                    isActive ? "text-green-500" : "text-gray-700 hover:text-green-500"
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
                  <span className="rounded-full bg-green-400 px-3 py-1.5 text-xs font-black text-black border-2 border-black shadow-md">
                    Team
                  </span>
                )}
                {currentCredits !== undefined && (
                  <span className="rounded-full bg-yellow-300 px-4 py-1.5 text-sm font-black text-black border-2 border-black shadow-md">
                    {currentCredits} credits
                  </span>
                )}
                {onHistoryClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onHistoryClick}
                    className="gap-2 rounded-full border-2 border-black font-black hover:bg-green-50 shadow-md"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                )}
                <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-black" } }} />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-700 font-black hover:text-green-500 hover:bg-green-50">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="rounded-full bg-green-500 px-6 py-2 text-white font-black hover:bg-green-600 border-2 border-black shadow-lg transform hover:scale-105 transition-all">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden border-2 border-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t-4 border-black bg-gradient-to-br from-yellow-50 to-green-50 pb-6 pt-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4">
            {allNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 font-black transition border-2 border-black shadow-md",
                    isActive ? "bg-green-400 text-black" : "bg-white hover:bg-green-50"
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
                  <div className="rounded-xl bg-yellow-300 px-4 py-3 text-center font-black text-black border-2 border-black shadow-md">
                    {currentCredits} credits
                  </div>
                )}
                {onHistoryClick && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl border-2 border-black font-black shadow-md"
                    onClick={() => { onHistoryClick(); setMobileMenuOpen(false); }}
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                )}
                <div className="flex justify-center pt-1">
                  <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-black" } }} />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full rounded-xl border-2 border-black font-black shadow-md">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full rounded-xl bg-green-500 text-white font-black hover:bg-green-600 border-2 border-black shadow-lg">
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
