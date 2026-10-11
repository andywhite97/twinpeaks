import { environment } from '../../environments/environment';

export function mediaUrl(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  if (value.startsWith('/assets/')) return value;
  try {
    const url = new URL(value, environment.apiUrl);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : '';
  } catch { return ''; }
}
export function phoneHref(value: string | undefined): string | null {
  const number = value?.replace(/[\s()-]/g, '') ?? '';
  return /^\+?\d{8,15}$/.test(number) ? `tel:${number}` : null;
}
