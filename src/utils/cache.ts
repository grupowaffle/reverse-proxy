export function generateCacheKey(request: Request): string {
    const url = new URL(request.url);
    return `${request.method}:${url.pathname}${url.search}`;
  }
  
  export function shouldCache(request: Request): boolean {
    return request.method === 'GET' && !request.headers.get('authorization');
  }
  