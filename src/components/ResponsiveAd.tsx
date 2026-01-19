import { AdsterraDisplayBanner } from './Adsterra';

interface ResponsiveAdProps {
  desktopBannerId: string;
  mobileBannerId?: string;
  className?: string;
}

/**
 * Responsive Ad Component - Hiển thị quảng cáo phù hợp với kích thước màn hình
 * Desktop: 728x90 (Leaderboard)
 * Mobile: 320x50 (Mobile Banner)
 */
export default function ResponsiveAd({
  desktopBannerId,
  mobileBannerId,
  className = '',
}: ResponsiveAdProps) {
  // Nếu không có mobile banner ID, sử dụng desktop banner ID
  const mobileBanner = mobileBannerId || desktopBannerId;

  return (
    <div className={`w-full flex justify-center ${className}`}>
      {/* Desktop Banner - 728x90 */}
      <div className="hidden md:block">
        <AdsterraDisplayBanner 
          bannerId={desktopBannerId}
          width={728}
          height={90}
        />
      </div>
      
      {/* Mobile Banner - 320x50 */}
      <div className="block md:hidden">
        <AdsterraDisplayBanner 
          bannerId={mobileBanner}
          width={320}
          height={50}
        />
      </div>
    </div>
  );
}

/**
 * Sidebar Ad Component - 300x250 (Medium Rectangle)
 * Phù hợp cho sidebar hoặc inline content
 */
interface SidebarAdProps {
  bannerId: string;
  className?: string;
  sticky?: boolean;
}

export function SidebarAd({ 
  bannerId, 
  className = '', 
  sticky = false 
}: SidebarAdProps) {
  return (
    <div className={`w-full flex justify-center ${sticky ? 'sticky top-4' : ''} ${className}`}>
      <AdsterraDisplayBanner 
        bannerId={bannerId}
        width={300}
        height={250}
      />
    </div>
  );
}

/**
 * In-Feed Ad Component - Quảng cáo giữa nội dung
 * Responsive: 300x250 trên desktop, 320x50 trên mobile
 */
interface InFeedAdProps {
  desktopBannerId: string;
  mobileBannerId?: string;
  className?: string;
}

export function InFeedAd({
  desktopBannerId,
  mobileBannerId,
  className = '',
}: InFeedAdProps) {
  const mobileBanner = mobileBannerId || desktopBannerId;

  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      {/* Desktop - 300x250 */}
      <div className="hidden md:block">
        <AdsterraDisplayBanner 
          bannerId={desktopBannerId}
          width={300}
          height={250}
        />
      </div>
      
      {/* Mobile - 320x50 */}
      <div className="block md:hidden">
        <AdsterraDisplayBanner 
          bannerId={mobileBanner}
          width={320}
          height={50}
        />
      </div>
    </div>
  );
}
