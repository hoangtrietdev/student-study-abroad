/** @type {import('next-i18next').UserConfig} */
const config = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
  },
  localePath: './public/locales',
  localDetection: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}

module.exports = config
