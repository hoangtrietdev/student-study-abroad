import { ReactNode } from 'react';
import ModernHeader from './ModernHeader';
import ModernFooter from './ModernFooter';
import CookieConsent from '../CookieConsent';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function MainLayout({
  children,
  title,
  showHeader = true,
  showFooter = true,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {showHeader && <ModernHeader title={title} />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <ModernFooter />}
      
      <CookieConsent />
    </div>
  );
}
