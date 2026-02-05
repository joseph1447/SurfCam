import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Don't add locale prefix to default locale URLs (Spanish)
  localePrefix: 'as-needed',
  
  // Always detect locale from browser Accept-Language header
  localeDetection: true,
});

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Static files (_next, images, etc.)
  // - Files with extensions
  // - Admin routes
  matcher: ['/((?!api|_next|_vercel|admin|createclip|.*\\..*).*)']
};

