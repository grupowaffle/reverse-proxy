import { ProxyRoute } from './types/proxy';

export const proxyRoutes: ProxyRoute[] = [
  {
    path: '/marketing',
    target: 'https://dash.testeswaffle.org',
    cacheControl: 'public, max-age=3600',
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  },
  {
    path: '/referrals',
    target: 'https://referrals.testeswaffle.org',
    rewrites: [
      {
        // Modificado para lidar com rotas do React e preservar query params
        source: '^/referrals/(subscribe|activate|.*)',
        destination: '/'
      },
      {
        source: '^/referrals/api/(.*)',
        destination: '/api/$1'
      }
    ],
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  {
    path: '/marcas',
    target: 'https://brands.testeswaffle.org',
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  },
  {
    path: '/',
    target: 'https://waffle.com.br',
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  }
];