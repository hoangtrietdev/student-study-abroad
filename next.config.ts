import type { NextConfig } from "next";
import nextI18NextConfig from './next-i18next.config.js';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: nextI18NextConfig.i18n,
  images: {
    domains: ["international.pte.hu"],
  },
  // SEO Optimizations
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Headers for SEO and Security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
