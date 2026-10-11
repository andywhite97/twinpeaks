import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { CompanyApi } from '../api/content-api';
import { CompanyProfile, RequestState } from '../api/contracts';

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private api = inject(CompanyApi);
  private destroyRef = inject(DestroyRef);
  private request?: Subscription;
  readonly profile = signal<CompanyProfile | null>(null);
  readonly status = signal<RequestState>('loading');
  load(): void {
    this.request?.unsubscribe(); this.status.set('loading');
    this.request = this.api.getCompany().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: profile => { this.profile.set(profile); this.status.set('ready'); },
      error: () => { this.profile.set(null); this.status.set('error'); },
    });
  }
}
