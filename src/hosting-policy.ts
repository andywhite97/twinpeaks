/** Conservative baseline CSP; strict script/style nonce policy needs hosting integration. */
export const securityHeaders = {
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export function allowedHost(host: string | undefined, siteUrl: string): boolean {
  if (!host || /[\s/@\\?#]/.test(host)) return false;
  try { return [new URL(siteUrl).hostname, 'localhost', '127.0.0.1'].includes(new URL('http://' + host).hostname); }
  catch { return false; }
}
export function staticCache(pathname: string): string {
  // Only Angular fingerprinted JS/CSS may be immutable. Public asset names are stable.
  return /(?:^|\/)[\w-]+-[A-Z0-9]{8,}\.(?:js|css)$/i.test(pathname)
    ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, must-revalidate';
}
export function compressionEncoding(header: string | undefined): 'br' | 'gzip' | undefined {
  const entries = (header ?? '').toLowerCase().split(',').map(part => {
    const [name, ...parameters] = part.trim().split(';');
    const quality = parameters.map(value => value.trim()).find(value => value.startsWith('q='));
    const q = quality ? Number(quality.slice(2)) : 1;
    return { name, q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
  });
  const quality = (name: string) => entries.find(entry => entry.name === name)?.q ?? entries.find(entry => entry.name === '*')?.q ?? 0;
  const br = quality('br'), gzip = quality('gzip');
  return br > 0 && br >= gzip ? 'br' : gzip > 0 ? 'gzip' : undefined;
}
