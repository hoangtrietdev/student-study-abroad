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
 * Banner ID từ Adsterra Dashboard
 * Format: a6/76/57/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
const ADSTERRA_BANNER_ID = 'a6/76/57/a67657795da16a9ffb9e24e32ad01450';

// ============================================
// CONFIG - KHÔNG CẦN CHỈNH SỬA
// ============================================

export const ADSTERRA_CONFIG = {
  // Dashboard Page
  dashboard: {
    topBanner: ADSTERRA_BANNER_ID,
  },

  // My Roadmaps Page  
  myRoadmaps: {
    topDesktopBanner: ADSTERRA_BANNER_ID,
    topMobileBanner: ADSTERRA_BANNER_ID,
    inFeedDesktopBanner: ADSTERRA_BANNER_ID,
    inFeedMobileBanner: ADSTERRA_BANNER_ID,
  },

  // Footer (Global)
  footer: {
    desktopBanner: ADSTERRA_BANNER_ID,
    mobileBanner: ADSTERRA_BANNER_ID,
  },

  // Contact Page
  contact: {
    banner: ADSTERRA_BANNER_ID,
  },

  // Custom Roadmap Page
  customRoadmap: {
    sidebarBanner: ADSTERRA_BANNER_ID,
  },

  // Popunder
  popunder: {
    key: ADSTERRA_BANNER_ID,
    scriptUrl: `https://pl28514680.effectivegatecpm.com/${ADSTERRA_BANNER_ID}.js`,
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
    bannerId: ADSTERRA_BANNER_ID,
  });
}
