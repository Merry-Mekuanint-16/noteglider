import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Disclaimer Banner */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">FilterNote is not a tool for academic dishonesty.</span>{" "}
              We encourage responsible use.
            </p>
            <Link href="/responsible-use" className="text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap ml-4">
              Read more
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="FilterNote" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-black text-gray-900">FilterNote</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              Make AI-generated text sound authentically human.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              NAVIGATE
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-green-600 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              LEGAL
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/responsible-use" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Responsible Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              CONTACT
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Contact us
                </Link>
              </li>
              <li>
                <a href="mailto:Filternote.humanizer@gmail.com" className="text-sm text-gray-600 hover:text-green-600 transition">
                  Filternote.humanizer@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} FilterNote. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Make AI sound human.
          </p>
        </div>
      </div>
    </footer>
  );
}
