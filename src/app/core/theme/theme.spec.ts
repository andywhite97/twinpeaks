import { resolveTheme } from './theme.service';
describe('Theme preference resolution', () => {
  it('defaults to light without a dark preference', () => expect(resolveTheme(null, false)).toBe('light'));
  it('uses the system dark preference', () => expect(resolveTheme(null, true)).toBe('dark'));
  it('restores manual light even with a dark system', () => expect(resolveTheme('light', true)).toBe('light'));
  it('restores manual dark even with a light system', () => expect(resolveTheme('dark', false)).toBe('dark'));
  it('ignores invalid stored preferences', () => expect(resolveTheme('invalid', true)).toBe('dark'));
});
