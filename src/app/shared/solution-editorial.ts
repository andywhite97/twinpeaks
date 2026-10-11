/** Concept photography is illustrative, never evidence of a client installation. */
export interface SolutionEditorial { image: string; alt: string; heading: string; cta: string; }
const editorial: Record<string, SolutionEditorial> = {
  'surveillance-alarm-systems': { image: 'surveillance-alarm-systems-concept-v1', alt: 'Concept photograph of CCTV cameras and an alarm keypad', heading: 'Plan visibility. Connect security.', cta: 'Discuss security for your space.' },
  'pos-supplies-solutions': { image: 'pos-supplies-solutions-concept-v1', alt: 'Concept photograph of a POS terminal, barcode scanner, receipt printer and card reader', heading: 'Connect your counter and your business.', cta: 'Explore the right point-of-sale approach.' },
  'it-support-maintenance': { image: 'it-support-maintenance-concept-v1', alt: 'Concept photograph of a diagnostic laptop, motherboard and maintenance tools', heading: 'Keep everyday systems in focus.', cta: 'Discuss support for your everyday systems.' },
  'network-infrastructure': { image: 'network-infrastructure-concept-v1', alt: 'Concept photograph of a network switch, patch panel and blue Ethernet cables', heading: 'Build connections that work together.', cta: 'Plan the connections your business needs.' },
  'web-app-development': { image: 'web-app-development-concept-v1', alt: 'Concept photograph of a laptop and smartphone showing responsive website layouts', heading: 'Bring your digital ideas into focus.', cta: 'Talk through your next digital project.' },
  'smart-security-solutions': { image: 'smart-security-solutions-concept-v1', alt: 'Concept photograph of an access reader, electronic door handle and access card', heading: 'Plan smarter access for your space.', cta: 'Discuss a connected security approach.' },
};
export function solutionEditorial(slug: string): SolutionEditorial | undefined { return editorial[slug]; }
export function conceptUrl(name: string): string { return `/assets/images/${name}.webp`; }
export function conceptSrcset(url: string): string {
  return /^\/assets\/images\/(technology-concept|security-concept|workplace-concept|network-digital-concept|(?:surveillance-alarm-systems|pos-supplies-solutions|it-support-maintenance|network-infrastructure|web-app-development|smart-security-solutions)-concept-v1)\.webp$/.test(url)
    ? `${url.replace('.webp', '-small.webp')} 560w, ${url} 1120w` : '';
}
