import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 border-t border-gray-800 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="opacity-80">
            © {new Date().getFullYear()} Study Overseas Map. All rights reserved.
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white underline-offset-4 hover:underline">Privacy Policy</Link>
            <span className="opacity-30">|</span>
            <Link href="/terms" className="hover:text-white underline-offset-4 hover:underline">Terms</Link>
            <span className="opacity-30">|</span>
            <Link href="/contact" className="hover:text-white underline-offset-4 hover:underline">Contact</Link>
          </nav>
        </div>
        <p className="mt-3 text-xs opacity-70">
          Ad disclosure: This site displays advertising served by Google AdSense. Ads are labeled and are not endorsed by Study Overseas Map. We do not encourage accidental clicks. User-generated content in the AI chat is moderated and may be restricted to comply with Google policies.
        </p>
      </div>
    </footer>
  );
}
