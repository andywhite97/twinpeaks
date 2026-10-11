import { FeaturePresentation, SolutionPresentation } from '../../shared/ui/cards';

/** Approved frontend information architecture; these slugs are NOT Django service fields. */
export const SOLUTIONS: SolutionPresentation[] = [
  { slug: 'surveillance-alarm-systems', title: 'Surveillance & Alarm Systems', summary: 'Security systems that bring visibility and control to your spaces.', icon: 'camera' },
  { slug: 'pos-supplies-solutions', title: 'POS Supplies & Solutions', summary: 'Point-of-sale technology to support the way your business works.', icon: 'pos' },
  { slug: 'it-support-maintenance', title: 'IT Support & Maintenance', summary: 'Practical technical support for your day-to-day systems.', icon: 'laptop' },
  { slug: 'network-infrastructure', title: 'Network Infrastructure', summary: 'Connected infrastructure designed around your environment.', icon: 'network' },
  { slug: 'web-app-development', title: 'Web & App Development', summary: 'Digital experiences that connect people, processes and businesses.', icon: 'code' },
  { slug: 'smart-security-solutions', title: 'Smart Security Solutions', summary: 'Integrated security technology for smarter, connected spaces.', icon: 'lock' },
];
export const BENEFITS: FeaturePresentation[] = [
  { title: 'Reliability', description: 'Practical technology built around your needs.', icon: 'shield' },
  { title: 'Progress', description: 'Connected systems that help your business move forward.', icon: 'progress' },
  { title: 'Partnership', description: 'A local perspective. A collaborative approach.', icon: 'people' },
  { title: 'Excellence', description: 'Thoughtful design, implementation and support.', icon: 'star' },
];
