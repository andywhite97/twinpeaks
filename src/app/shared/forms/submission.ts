import { DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/** Component-scoped, transient state. No payloads, tokens or customer data are stored here. */
export class Submission {
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setTimeout>;
  readonly state = signal<'idle' | 'pending' | 'success' | 'error'>('idle');
  readonly message = signal('');
  readonly ambiguous = signal(false);
  readonly retryAcknowledged = signal(false);
  readonly cooldown = signal(false);
  constructor() { this.destroyRef.onDestroy(() => clearTimeout(this.timer)); }
  blocked(): boolean { return this.state() === 'pending' || this.state() === 'success' || this.cooldown() || (this.ambiguous() && !this.retryAcknowledged()); }
  send<T>(request: () => Observable<T>, confirmed: (value: T) => boolean, success: (value: T) => void, invalid: (fields: string[]) => void): void {
    if (this.blocked()) return;
    this.state.set('pending'); this.message.set(''); this.ambiguous.set(false); this.retryAcknowledged.set(false);
    request().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        if (!confirmed(value)) { this.uncertain(); return; }
        this.state.set('success'); success(value);
      },
      error: error => {
        this.state.set('error');
        if (error instanceof HttpErrorResponse && error.status === 429) {
          this.message.set('Too many requests. Please wait before trying again, or contact TwinPeaks directly.');
          const retry = error.headers.get('Retry-After');
          const milliseconds = retry && /^\d+(\.\d+)?$/.test(retry) ? Number(retry) * 1000 : retry ? Date.parse(retry) - Date.now() : 60000;
          this.cooldown.set(true);
          this.timer = setTimeout(() => this.cooldown.set(false), Math.min(Math.max(Number.isFinite(milliseconds) ? milliseconds : 60000, 1000), 2147483647));
        } else if (error instanceof HttpErrorResponse && error.status === 400) {
          invalid(error.error && typeof error.error === 'object' ? Object.keys(error.error) : []);
          this.message.set('The server could not validate this request. Review the highlighted fields and try again. Your information has been preserved.');
        } else if (error instanceof HttpErrorResponse && [401, 403, 404, 405, 413, 422].includes(error.status)) {
          this.message.set('This request could not be accepted. Your information has been preserved. Contact TwinPeaks directly if the issue continues.');
        } else this.uncertain();
      },
    });
  }
  private uncertain(): void {
    this.state.set('error'); this.ambiguous.set(true); this.retryAcknowledged.set(false);
    this.message.set('We could not confirm the outcome. Your request may already have been saved. Contact TwinPeaks before resending to avoid a duplicate. Your information is still here.');
  }
}
