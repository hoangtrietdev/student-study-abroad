export const ADSTERRA_ENABLED = true;


export const POPUNDER_ENABLED = true;

/**
 * Popunder ID from Adsterra Dashboard
 */
const ADSTERRA_POPUNDER_ID = 'a67657795da16a9ffb9e24e32ad01450';

/**
 * Banner 728x90 ID from Adsterra Dashboard
 */
const ADSTERRA_BANNER_728x90_ID = 'a1c9eeb413db5df64f4d6735abc44cef';


export const ADSTERRA_CONFIG = {
  // Dashboard Page
  dashboard: {
    topBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
  },

  // My Roadmaps Page  
  myRoadmaps: {
    topDesktopBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
    topMobileBanner: ADSTERRA_BANNER_728x90_ID, //mobile
    inFeedDesktopBanner: ADSTERRA_BANNER_728x90_ID, //
    inFeedMobileBanner: ADSTERRA_BANNER_728x90_ID, //
  },

  // Footer (Global)
  footer: {
    desktopBanner: ADSTERRA_BANNER_728x90_ID, // 728x90 banner
    mobileBanner: ADSTERRA_BANNER_728x90_ID, //
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

export const isAdsEnabled = (): boolean => {
  return ADSTERRA_ENABLED;
};


export const isPopunderEnabled = (): boolean => {
  return ADSTERRA_ENABLED && POPUNDER_ENABLED;
};


export const isAdConfigured = (bannerId: string): boolean => {
  return Boolean(bannerId && !bannerId.startsWith('YOUR_') && bannerId.length > 0);
};

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
