import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ServicesApi } from '../../core/api/content-api';
import { RequestState, ServiceDto } from '../../core/api/contracts';

@Injectable({ providedIn: 'root' })
export class ServiceCatalog {
  private api = inject(ServicesApi); private destroyRef = inject(DestroyRef); private request?: Subscription; private requested = false;
  readonly records = signal<ServiceDto[]>([]); readonly state = signal<RequestState>('loading');
  ensureLoaded(): void { if (!this.requested) this.load(); }
  load(): void {
    this.requested = true; this.request?.unsubscribe(); this.state.set('loading');
    this.request = this.api.getServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: records => { this.records.set(records); this.state.set('ready'); }, error: () => { this.records.set([]); this.state.set('error'); } });
  }
}
