/** Isolated browser fixtures only. Never use this configuration for deployment. */
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:18181/api',
  siteUrl: 'http://127.0.0.1:18182',
  requestTimeout: 8000,
} as const;
