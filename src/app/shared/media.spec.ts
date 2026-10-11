import { mediaUrl, phoneHref } from './media';
describe('Optional media and verified contact links', () => {
  it('handles missing images', () => expect(mediaUrl(null)).toBe(''));
  it('resolves backend media against the API origin', () => expect(mediaUrl('/media/project.png')).toBe('http://127.0.0.1:8000/media/project.png'));
  it('keeps local official assets local', () => expect(mediaUrl('/assets/brand/icon_only.png')).toBe('/assets/brand/icon_only.png'));
  it('rejects script and credential URLs', () => { expect(mediaUrl('javascript:alert(1)')).toBe(''); expect(mediaUrl('https://user:secret@example.com/a')).toBe(''); });
  it('only produces usable phone links', () => { expect(phoneHref('+268 7600 0000')).toBe('tel:+26876000000'); expect(phoneHref('not published')).toBeNull(); });
});
