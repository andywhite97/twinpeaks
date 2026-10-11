import { conceptSrcset, solutionEditorial } from './solution-editorial';
import { SOLUTION_CONFIGS } from '../features/solutions/solution-config';
describe('Refined concept imagery boundary', () => {
  it('defines relevant imagery for every approved category without backend identifiers', () => {
    expect(SOLUTION_CONFIGS.every(s => !!solutionEditorial(s.slug)?.image && !!solutionEditorial(s.slug)?.heading)).toBeTrue();
    expect(solutionEditorial('unknown')).toBeUndefined();
    expect(new Set(SOLUTION_CONFIGS.map(s => solutionEditorial(s.slug)?.image)).size).toBe(SOLUTION_CONFIGS.length);
  });
  it('only supplies responsive variants for known local concept assets', () => {
    expect(conceptSrcset('/assets/images/security-concept.webp')).toContain('security-concept-small.webp 560w');
    for (const solution of SOLUTION_CONFIGS) {
      const image = solutionEditorial(solution.slug)!.image;
      expect(conceptSrcset('/assets/images/' + image + '.webp')).toBe('/assets/images/' + image + '-small.webp 560w, /assets/images/' + image + '.webp 1120w');
    }
    expect(conceptSrcset('/assets/images/unapproved-concept-v1.webp')).toBe('');
    expect(conceptSrcset('https://example.invalid/project.jpg')).toBe('');
    expect(conceptSrcset('/media/project.webp')).toBe('');
  });
});
