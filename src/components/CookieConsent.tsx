import { useEffect, useState } from 'react';

declare global {
  interface Window { gtag?: (command: string, ...args: unknown[]) => void }
}

const CONSENT_KEY = 'som-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : null;
    if (!stored) setVisible(true);
  }, []);

  const acceptAll = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      }
    } catch {}
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const rejectAll = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
        });
      }
    } catch {}
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-200 shadow-xl">
        <p className="mb-3">
          We use cookies to provide basic site functionality and enhance your experience. You can accept or reject optional cookies. You can change your choice later in your browser settings.
        </p>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={rejectAll} className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600">Reject all</button>
          <button onClick={acceptAll} className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white">Accept all</button>
        </div>
      </div>
    </div>
  );
}
