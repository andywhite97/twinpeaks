import { DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsApi } from '../../core/api/content-api';
import { enquiryContext } from '../../shared/forms/lead-helpers';
import { skip, Subscription } from 'rxjs';

/** Only allowlisted categories and an existing published project enter request context. */
export class LeadContext {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProjectsApi);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private readonly current = signal(enquiryContext(this.route.snapshot.queryParamMap));
  get value() { return this.current(); }
  readonly projectTitle = signal(''); readonly pending = signal(false); readonly unavailable = signal(false);
  constructor() {
    this.loadProject();
  }
  listen(preselect: () => void): void {
    this.route.queryParamMap?.pipe(skip(1), takeUntilDestroyed(this.destroy)).subscribe(params => {
      this.current.set(enquiryContext(params)); this.loadProject(); preselect();
    });
  }
  private loadProject(): void {
    this.request?.unsubscribe(); this.projectTitle.set(''); this.unavailable.set(false); this.pending.set(false);
    if (this.value.project) {
      const slug = this.value.project;
      this.pending.set(true);
      this.request = this.api.getProject(slug).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: project => { if (project?.slug === slug && typeof project.title === 'string' && project.title.trim()) this.projectTitle.set(project.title.slice(0, 200)); else this.unavailable.set(true); this.pending.set(false); },
        error: () => { this.unavailable.set(true); this.pending.set(false); },
      });
    }
  }
  text(): string { return [this.value.assessment ? 'Enquiry: site assessment requested (subject to confirmation)' : '', this.projectTitle() ? `Published project reference: ${this.projectTitle()} (${this.value.project})` : ''].filter(Boolean).join('\n'); }
}
