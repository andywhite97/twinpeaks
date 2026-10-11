import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Projects } from './projects';
import { ProjectDto } from '../../core/api/contracts';
import { ProjectsApi } from '../../core/api/content-api';
import { galleryImages } from './project-gallery';
import { validCompletionDate } from './project-detail';
describe('Published project filtering and recovery', () => {
  let result: Subject<ProjectDto[]>;
  beforeEach(() => { result = new Subject(); TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ProjectsApi, useValue: { getProjects: () => result } }] }); });
  it('derives filters only from available category records', () => {
    const fixture = TestBed.createComponent(Projects); result.next([{ id: 1, category: 'Security' }, { id: 2, category: 'Network' }, { id: 3, category: 'Security ' }, { id: 4, category: '' }] as ProjectDto[]);
    expect(fixture.componentInstance.categories()).toEqual(['Network', 'Security']); fixture.componentInstance.category.set('Security'); expect(fixture.componentInstance.filtered().map(p => p.id)).toEqual([1, 3]); expect(fixture.componentInstance.count('Security')).toBe(2);
  });
  it('offers retry for errors, restores empty state and cancels on destroy', () => {
    const fixture = TestBed.createComponent(Projects); result.error(new Error('Synthetic')); expect(fixture.componentInstance.state()).toBe('error'); result = new Subject(); fixture.componentInstance.load(); result.next([]); expect(fixture.componentInstance.state()).toBe('ready'); expect(fixture.componentInstance.filtered()).toEqual([]); fixture.destroy(); expect(result.observed).toBeFalse();
  });
  it('clears a removed category on refresh', () => {
    const fixture = TestBed.createComponent(Projects); result.next([{ id: 1, category: 'Security' }] as ProjectDto[]); fixture.componentInstance.category.set('Security'); result.next([]); expect(fixture.componentInstance.category()).toBe('');
  });
  it('deduplicates, orders and rejects unsafe gallery sources', () => {
    const project = { title: 'QA', image: '/media/main.svg', images: [{ image: '/media/main.svg', caption: '', display_order: 0 }, { image: '/media/second.svg', caption: 'Second', display_order: 2 }, { image: 'javascript:alert(1)', caption: '', display_order: 1 }] } as ProjectDto;
    expect(galleryImages(project).map(image => image.url)).toEqual(['/media/main.svg', '/media/second.svg']);
  });
  it('only shows valid supplied completion dates', () => { expect(validCompletionDate('2026-02-30')).toBeNull(); expect(validCompletionDate(null)).toBeNull(); expect(validCompletionDate('2026-10-10')).toBe('2026-10-10'); });
});
