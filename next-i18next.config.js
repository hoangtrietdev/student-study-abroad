/** @type {import('next-i18next').UserConfig} */
const path = require('path');

const config = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
  },
  localePath: typeof window === 'undefined' 
    ? path.resolve('./public/locales') 
    : '/locales',
  localeDetection: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // Prevent keys from showing during SSR/hydration
  react: {
    useSuspense: false,
  },
  // Ensure translations are loaded before render
  serializeConfig: false,
}

module.exports = config
