import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
  /** Always start in Arabic; ignore browser Accept-Language unless user picks /en. */
  localeDetection: false,
});