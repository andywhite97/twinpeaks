/** Concept photography is illustrative, never evidence of a client installation. */
export interface SolutionEditorial { image: string; alt: string; heading: string; cta: string; }
const editorial: Record<string, SolutionEditorial> = {
  'surveillance-alarm-systems': { image: 'security-concept', alt: 'Concept photograph of a camera and access reader', heading: 'Plan visibility. Connect security.', cta: 'Discuss security for your space.' },
  'pos-supplies-solutions': { image: 'workplace-concept', alt: 'Concept photograph of point-of-sale equipment and a laptop', heading: 'Connect your counter and your business.', cta: 'Explore the right point-of-sale approach.' },
  'it-support-maintenance': { image: 'workplace-concept', alt: 'Concept photograph of a business workstation', heading: 'Keep everyday systems in focus.', cta: 'Discuss support for your everyday systems.' },
  'network-infrastructure': { image: 'network-digital-concept', alt: 'Concept photograph of networking equipment', heading: 'Build connections that work together.', cta: 'Plan the connections your business needs.' },
  'web-app-development': { image: 'network-digital-concept', alt: 'Concept photograph of a laptop with an abstract digital interface', heading: 'Bring your digital ideas into focus.', cta: 'Talk through your next digital project.' },
  'smart-security-solutions': { image: 'security-concept', alt: 'Concept photograph of connected access and security equipment', heading: 'Plan smarter access for your space.', cta: 'Discuss a connected security approach.' },
};
export function solutionEditorial(slug: string): SolutionEditorial | undefined { return editorial[slug]; }
export function conceptUrl(name: string): string { return `/assets/images/${name}.webp`; }
export function conceptSrcset(url: string): string {
  return /^\/assets\/images\/(technology-concept|security-concept|workplace-concept|network-digital-concept)\.webp$/.test(url)
    ? `${url.replace('.webp', '-small.webp')} 560w, ${url} 1120w` : '';
}
