import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyStore } from '../../core/state/company-store';
import { PageHeader, SectionHeading } from '../../shared/ui/headings';
import { SolutionCard, FeatureCard } from '../../shared/ui/cards';
import { CTASection } from '../../shared/ui/cta-section';
import { SOLUTIONS, BENEFITS } from '../home/solution-categories';
import { approvedCopy } from '../../shared/forms/lead-helpers';

@Component({ selector: 'app-about', imports: [RouterLink, PageHeader, SectionHeading, SolutionCard, FeatureCard, CTASection], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-header title="About TwinPeaks" eyebrow="Technology · Security · Digital solutions" description="Built on Vision, Driven by Progress. Practical technology for businesses and communities in Eswatini." image="/assets/images/technology-concept.webp" imageAlt="Concept illustration of a contemporary technology workspace"><div class="hero-actions"><a class="button button-primary" routerLink="/solutions">Explore Solutions</a><a class="button button-secondary" routerLink="/contact">Contact Us</a></div></app-page-header>
  <section class="section container"><div class="story-layout"><div><p class="eyebrow">Our story</p><h2>Connecting people, technology and progress.</h2></div><div><p>TwinPeaks Investment is an Eswatini-based technology and security solutions company, providing IT solutions, security systems, POS solutions and digital services.</p>@if (copy(company.profile()?.overview); as overview) { <p class="editorial-copy">{{ overview }}</p> }@else { <p>Our focus is helping businesses and communities grow with confidence through practical solutions and a collaborative approach.</p> }</div></div>
  @if (copy(company.profile()?.mission) || copy(company.profile()?.vision)) { <div class="purpose-grid">@if (copy(company.profile()?.mission); as mission) { <article class="panel"><p class="eyebrow">Our mission</p><p class="editorial-copy">{{ mission }}</p></article> }@if (copy(company.profile()?.vision); as vision) { <article class="panel"><p class="eyebrow">Our vision</p><p class="editorial-copy">{{ vision }}</p></article> }</div> }
  <div class="values-line"><span class="eyebrow">Our values</span><p>Reliability · Progress · Partnership · Solutions · Excellence</p></div></section>
  <section class="section section-tinted"><div class="container"><app-section-heading eyebrow="Why choose TwinPeaks" title="A practical approach. A local perspective." description="Start with your needs. Discuss the right scope, priorities and support for your environment." /><div class="corporate-benefits">@for (benefit of benefits; track benefit.title) { <app-feature-card [feature]="benefit" /> }</div></div></section>
  <section class="section container"><app-section-heading eyebrow="Our capabilities" title="Technology, security and digital solutions." description="Explore the six solution areas and discuss the options for your project." /><div class="solutions-grid">@for (solution of solutions; track solution.slug) { <app-solution-card [solution]="solution" /> }</div></section><app-cta-section title="Let's talk about your next step." description="Share your priorities with TwinPeaks and request a solution tailored to your needs." />`,
})
export class About {
  readonly company = inject(CompanyStore); readonly copy = approvedCopy; readonly solutions = SOLUTIONS;
  readonly benefits = [...BENEFITS.slice(0, 3), { title: 'Practical solutions', description: 'Discuss technology around your environment and priorities.', icon: 'network' as const }, { title: 'Technical support', description: 'Talk through installation, maintenance and support requirements.', icon: 'laptop' as const }, { title: 'Customer service', description: 'A conversation about your needs and the next steps.', icon: 'people' as const }];
}
