import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
  // Always start in Arabic; do not follow browser Accept-Language
  localeDetection: false,
});