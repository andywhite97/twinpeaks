import { conceptSrcset, solutionEditorial } from './solution-editorial';
import { SOLUTION_CONFIGS } from '../features/solutions/solution-config';
describe('Refined concept imagery boundary', () => {
  it('defines relevant imagery for every approved category without backend identifiers', () => {
    expect(SOLUTION_CONFIGS.every(s => !!solutionEditorial(s.slug)?.image && !!solutionEditorial(s.slug)?.heading)).toBeTrue();
    expect(solutionEditorial('unknown')).toBeUndefined();
  });
  it('only supplies responsive variants for known local concept assets', () => {
    expect(conceptSrcset('/assets/images/security-concept.webp')).toContain('security-concept-small.webp 560w');
    expect(conceptSrcset('https://example.invalid/project.jpg')).toBe('');
    expect(conceptSrcset('/media/project.webp')).toBe('');
  });
});
