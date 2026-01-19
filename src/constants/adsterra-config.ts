/**
 * Adsterra Configuration & Control
 * 
 * File này cho phép bật/tắt quảng cáo một cách dễ dàng
 */

// ============================================
// CÀI ĐẶT CHÍNH - ĐIỀU CHỈNH Ở ĐÂY
// ============================================

/**
 * Bật/tắt tất cả quảng cáo Adsterra
 * Set = false để tắt toàn bộ quảng cáo (dùng cho testing)
 * Set = true để bật quảng cáo (production)
 */
export const ADSTERRA_ENABLED = true;

/**
 * Bật/tắt Popunder riêng
 * Popunder có revenue cao nhưng có thể ảnh hưởng UX
 * Set = false nếu bạn chỉ muốn banner ads
 */
export const POPUNDER_ENABLED = true;

/**
 * Popunder ID từ Adsterra Dashboard
 */
const ADSTERRA_POPUNDER_ID = '28414181';

/**
 * Banner 728x90 ID từ Adsterra Dashboard
 */
const ADSTERRA_BANNER_728x90_ID = '28414272';

// ============================================
// CONFIG - KHÔNG CẦN CHỈNH SỬA
// ============================================

export const ADSTERRA_CONFIG = {
  // Dashboard Page
  dashboard: {
    topBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
  },

  // My Roadmaps Page  
  myRoadmaps: {
    topDesktopBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
    topMobileBanner: ADSTERRA_BANNER_728x90_ID, // Dùng chung cho mobile
    inFeedDesktopBanner: ADSTERRA_BANNER_728x90_ID, // Dùng chung
    inFeedMobileBanner: ADSTERRA_BANNER_728x90_ID, // Dùng chung
  },

  // Footer (Global)
  footer: {
    desktopBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
    mobileBanner: ADSTERRA_BANNER_728x90_ID, // Dùng chung
  },

  // Contact Page
  contact: {
    banner: ADSTERRA_BANNER_728x90_ID,
  },

  // Custom Roadmap Page
  customRoadmap: {
    sidebarBanner: ADSTERRA_BANNER_728x90_ID,
  },

  // Popunder (High Revenue)
  popunder: {
    key: ADSTERRA_POPUNDER_ID, // Popunder ID
    scriptUrl: `https://pl28514680.effectivegatecpm.com/${ADSTERRA_POPUNDER_ID}/invoke.js`,
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra xem ads có được bật không
 */
export const isAdsEnabled = (): boolean => {
  return ADSTERRA_ENABLED;
};

/**
 * Kiểm tra xem popunder có được bật không
 */
export const isPopunderEnabled = (): boolean => {
  return ADSTERRA_ENABLED && POPUNDER_ENABLED;
};

/**
 * Kiểm tra xem Banner ID đã được cấu hình chưa
 */
export const isAdConfigured = (bannerId: string): boolean => {
  return Boolean(bannerId && !bannerId.startsWith('YOUR_') && bannerId.length > 0);
};

/**
 * Lấy Banner ID với fallback
 */
export const getBannerId = (
  bannerId: string, 
  fallbackId?: string
): string | undefined => {
  if (!ADSTERRA_ENABLED) return undefined;
  
  if (isAdConfigured(bannerId)) {
    return bannerId;
  }
  if (fallbackId && isAdConfigured(fallbackId)) {
    return fallbackId;
  }
  return undefined;
};

// ============================================
// DEVELOPMENT INFO
// ============================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🎯 Adsterra Config:', {
    enabled: ADSTERRA_ENABLED,
    popunderEnabled: POPUNDER_ENABLED,
    popunderId: ADSTERRA_POPUNDER_ID,
    banner728x90Id: ADSTERRA_BANNER_728x90_ID,
  });
}
