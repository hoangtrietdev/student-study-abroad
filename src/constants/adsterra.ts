/**
 * Adsterra Banner IDs Configuration
 * 
 * Cập nhật các Banner IDs sau khi tạo ad units trên Adsterra Dashboard
 * https://publishers.adsterra.com/
 */

export const ADSTERRA_CONFIG = {
  // Dashboard Page
  dashboard: {
    topBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // 728x90 - Popunder (sẽ hoạt động toàn site)
  },

  // My Roadmaps Page  
  myRoadmaps: {
    topDesktopBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
    topMobileBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
    inFeedDesktopBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
    inFeedMobileBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
  },

  // Footer (Global)
  footer: {
    desktopBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
    mobileBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
  },

  // Contact Page (Optional)
  contact: {
    banner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
  },

  // Custom Roadmap Page (Optional)
  customRoadmap: {
    sidebarBanner: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450', // Dùng chung ID
  },

  // Popunder (Active - High revenue)
  popunder: {
    key: 'a6/76/57/a67657795da16a9ffb9e24e32ad01450',
  },
} as const;

/**
 * Helper function để kiểm tra xem Banner ID đã được cấu hình chưa
 */
export const isAdConfigured = (bannerId: string): boolean => {
  return Boolean(bannerId && !bannerId.startsWith('YOUR_'));
};

/**
 * Helper function để lấy Banner ID với fallback
 */
export const getBannerId = (
  bannerId: string, 
  fallbackId?: string
): string | undefined => {
  if (isAdConfigured(bannerId)) {
    return bannerId;
  }
  if (fallbackId && isAdConfigured(fallbackId)) {
    return fallbackId;
  }
  return undefined;
};
