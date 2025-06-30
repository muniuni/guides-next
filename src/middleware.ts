import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/config';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, excluding API routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ja|en)/:path*',

    // Enable redirects that add missing locales
    // Explicitly exclude api, _next, _vercel and file extensions
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};