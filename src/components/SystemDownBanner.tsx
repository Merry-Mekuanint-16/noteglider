"use client";

import { AlertCircle } from "lucide-react";

export default function SystemDownBanner() {
  return (
    <div className="bg-red-600 text-white px-4 py-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs sm:text-sm font-bold text-center">
          SYSTEM ALERT: The system is down and we are working hard to fix it.
        </p>
      </div>
    </div>
  );
}
