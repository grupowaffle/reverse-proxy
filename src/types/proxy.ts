export interface ProxyRoute {
  path: string;
  target: string;
  rewrites?: {
    source: string;
    destination: string;
  }[];
  headers?: Record<string, string>;
  cacheControl?: string;
} 