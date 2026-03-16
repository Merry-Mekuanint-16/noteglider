"use client";

import { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "filternote-cookie-consent";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error("Error parsing cookie consent:", e);
      }
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({ necessary: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    savePreferences({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              We value your privacy
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              We use cookies to enhance your experience and analyze site traffic. 
              By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showSettings ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={acceptAll}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition"
            >
              Accept All
            </button>
            <button
              onClick={acceptNecessary}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition"
            >
              Necessary Only
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <Settings className="h-4 w-4" />
              Customize
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 cursor-not-allowed">
                <input type="checkbox" checked={true} disabled className="mt-1 accent-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Necessary</p>
                  <p className="text-xs text-gray-500">Required for the website to function.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 accent-green-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Analytics</p>
                  <p className="text-xs text-gray-500">Help us understand how you use our site.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 accent-green-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Marketing</p>
                  <p className="text-xs text-gray-500">Used for personalized content.</p>
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={saveCustom}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
