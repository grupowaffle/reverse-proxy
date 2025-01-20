export function sanitizeHeaders(headers: Headers): Headers {
  const sanitized = new Headers(headers);
  const sensitiveHeaders = ['authorization', 'cookie', 'host'];
  
  sensitiveHeaders.forEach(header => sanitized.delete(header));
  return sanitized;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 