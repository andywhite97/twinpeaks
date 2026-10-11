import { mappedService, SOLUTION_CONFIGS, relatedSolutionProjects } from './solution-config';
import { ProjectDto, ServiceDto } from '../../core/api/contracts';
describe('Solution configuration and verified service mapping', () => {
  it('defines exactly six unique approved routes without invented service ids', () => { expect(SOLUTION_CONFIGS.length).toBe(6); expect(new Set(SOLUTION_CONFIGS.map(s => s.slug)).size).toBe(6); expect(SOLUTION_CONFIGS.every(s => s.serviceTitles.length && s.capabilities.length && s.applications.length && !s.faqs.length)).toBeTrue(); });
  it('matches a unique published title and retains its actual backend id', () => {
    const service = { id: 72, title: 'Surveillance & Alarm Systems', description: 'Published', icon: null }; expect(mappedService(SOLUTION_CONFIGS[0]!, [service])?.id).toBe(72);
  });
  it('does not infer identifiers from slugs or loosely related titles', () => {
    expect(mappedService(SOLUTION_CONFIGS[0]!, [{ id: 1, title: 'surveillance-alarm-systems', description: '', icon: null }])).toBeNull();
    expect(mappedService(SOLUTION_CONFIGS[0]!, [{ id: 2, title: 'Security consulting', description: '', icon: null }])).toBeNull();
  });
  it('fails safely for absent or ambiguous records', () => {
    expect(mappedService(SOLUTION_CONFIGS[0]!, [])).toBeNull(); const record: ServiceDto = { id: 1, title: SOLUTION_CONFIGS[0]!.title, description: '', icon: null };
    expect(mappedService(SOLUTION_CONFIGS[0]!, [record, { ...record, id: 2 }])).toBeNull();
  });
  it('only relates projects by explicitly configured published categories', () => {
    const projects = [{ id: 1, category: 'Security' }, { id: 2, category: 'Unrelated' }] as ProjectDto[];
    expect(relatedSolutionProjects(SOLUTION_CONFIGS[0]!, projects).map(p => p.id)).toEqual([1]);
  });
});
