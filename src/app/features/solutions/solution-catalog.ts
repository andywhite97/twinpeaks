import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { SolutionsApi } from '../../core/api/content-api';
import { RequestState, SolutionDto } from '../../core/api/contracts';

@Injectable({ providedIn: 'root' })
export class SolutionCatalog {
  private api = inject(SolutionsApi); private destroyRef = inject(DestroyRef); private request?: Subscription; private requested = false;
  readonly records = signal<SolutionDto[]>([]); readonly state = signal<RequestState>('loading');
  ensureLoaded(): void { if (!this.requested) this.load(); }
  load(): void {
    this.requested = true; this.request?.unsubscribe(); this.state.set('loading');
    this.request = this.api.getSolutions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: records => { this.records.set(records); this.state.set('ready'); }, error: () => { this.records.set([]); this.state.set('error'); } });
  }
}
