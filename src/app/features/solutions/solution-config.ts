import { SolutionDto, ProjectDto } from '../../core/api/contracts';
import { SOLUTIONS } from '../home/solution-categories';
import { SolutionPresentation } from '../../shared/ui/cards';

export interface SolutionConfig extends SolutionPresentation {
  solutionTitles: readonly string[];
  projectCategories: readonly string[];
  capabilities: readonly string[];
  applications: readonly string[];
  faqs: readonly { question: string; answer: string }[];
}
// Frontend navigation only. No slug-to-id inference or hardcoded service ids.
const scope: Record<string, Pick<SolutionConfig, 'capabilities' | 'applications' | 'projectCategories'>> = {
  'surveillance-alarm-systems': { capabilities: ['Camera placement and coverage', 'Recording and monitoring requirements', 'Alarm requirements', 'Installation and handover planning'], applications: ['Homes and residential spaces', 'Offices and commercial premises', 'Storage and shared facilities'], projectCategories: ['Surveillance & Alarm Systems', 'Security'] },
  'pos-supplies-solutions': { capabilities: ['Point-of-sale hardware requirements', 'Software and workflow compatibility', 'Accessories and connectivity', 'Installation and user support'], applications: ['Retail counters', 'Hospitality and service businesses', 'Stock and sales workflows'], projectCategories: ['POS Supplies & Solutions', 'POS Solutions'] },
  'it-support-maintenance': { capabilities: ['System troubleshooting', 'Hardware and software maintenance', 'Upgrade requirements', 'Support and maintenance planning'], applications: ['Office workstations', 'Small business systems', 'Day-to-day technical operations'], projectCategories: ['IT Support & Maintenance'] },
  'network-infrastructure': { capabilities: ['Network design and connectivity', 'Structured cabling requirements', 'Wired and wireless coverage', 'Configuration and handover'], applications: ['Business offices', 'Multi-room premises', 'Connected devices and systems'], projectCategories: ['Network Infrastructure', 'IT Infrastructure'] },
  'web-app-development': { capabilities: ['Website and application requirements', 'User journeys and interface design', 'Integration requirements', 'Maintenance and support planning'], applications: ['Business websites', 'Customer-facing digital services', 'Internal business workflows'], projectCategories: ['Web & App Development', 'Web & App'] },
  'smart-security-solutions': { capabilities: ['Access control requirements', 'Security system integration', 'Entry and visitor workflows', 'Installation and support planning'], applications: ['Controlled entrances', 'Shared business spaces', 'Connected security environments'], projectCategories: ['Smart Security Solutions', 'Security'] },
};
export const SOLUTION_CONFIGS: readonly SolutionConfig[] = SOLUTIONS.map(solution => ({ ...solution, ...scope[solution.slug]!, solutionTitles: [solution.title], faqs: [] }));
export const normalizeTitle = (value: string | null | undefined) => (value ?? '').toLowerCase().replace(/&/g, ' and ').replace(/\s+/g, ' ').trim();
export function mappedSolutionRecord(solution: SolutionConfig, services: readonly SolutionDto[]): SolutionDto | null {
  const titles = solution.solutionTitles.map(normalizeTitle);
  const matches = services.filter(service => titles.includes(normalizeTitle(service.title)));
  return matches.length === 1 ? matches[0]! : null; // Missing or ambiguous records are not quotation identifiers.
}
export function relatedSolutionProjects(solution: SolutionConfig, projects: readonly ProjectDto[]): ProjectDto[] {
  const categories = solution.projectCategories.map(normalizeTitle);
  return projects.filter(project => categories.includes(normalizeTitle(project.category))).slice(0, 3);
}
