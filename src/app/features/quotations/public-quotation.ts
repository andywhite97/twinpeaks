import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, combineLatest, EMPTY, Subscription, switchMap } from 'rxjs';
import { QuotationApi } from '../../core/api/quotation-api';
import { PublicQuotationDto } from '../../core/api/contracts';
import { PageHeader } from '../../shared/ui/headings';
import { ErrorState, LoadingState } from '../../shared/ui/states';
import { ToastService } from '../../shared/ui/toast-notification';

@Component({ selector: 'app-public-quotation', imports: [PageHeader, ErrorState, LoadingState, ReactiveFormsModule],
  templateUrl: './public-quotation.html', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicQuotation {
  private route = inject(ActivatedRoute); private api = inject(QuotationApi); private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService); private reload = new BehaviorSubject<void>(undefined); private decisionRequest?: Subscription;
  readonly token = signal(''); readonly quotation = signal<PublicQuotationDto | null>(null);
  readonly loading = signal(true); readonly error = signal(false); readonly processing = signal(false); readonly decisionMessage = signal('');
  readonly decisionForm = new FormGroup({ reason: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }) });
  readonly needsReload = signal(false);
  readonly canRespond = computed(() => ['sent', 'viewed'].includes(this.quotation()?.status ?? '') && !this.processing() && !this.loading() && !this.needsReload());
  readonly canDownload = computed(() => ['sent', 'viewed', 'accepted', 'expired', 'converted_to_order'].includes(this.quotation()?.status ?? ''));
  readonly pdfUrl = computed(() => this.api.pdfUrl(this.token()));

  constructor() {
    combineLatest([this.route.paramMap, this.reload]).pipe(switchMap(([params]) => {
      this.decisionRequest?.unsubscribe(); this.processing.set(false); this.decisionMessage.set(''); this.needsReload.set(false);
      this.decisionForm.reset(); this.token.set(params.get('token') ?? ''); this.quotation.set(null); this.error.set(false); this.loading.set(true);
      return this.api.getQuotation(this.token()).pipe(catchError(() => { this.error.set(true); this.loading.set(false); return EMPTY; }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(quotation => { this.quotation.set(quotation); this.loading.set(false); });
  }
  retry(): void { this.reload.next(); }
  decide(decision: 'accept' | 'decline'): void {
    if (!this.canRespond() || (decision === 'decline' && this.decisionForm.invalid)) { this.decisionForm.markAllAsTouched(); return; }
    this.processing.set(true); this.decisionMessage.set('');
    const token = this.token();
    this.decisionRequest = this.api.decide(token, decision, this.decisionForm.controls.reason.value)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: quotation => {
          if (this.token() !== token) return;
          if (!quotation || quotation.quote_number !== this.quotation()?.quote_number || quotation.status !== (decision === 'accept' ? 'accepted' : 'declined')) { this.uncertain(); return; }
          this.quotation.set(quotation); this.processing.set(false);
          const message = decision === 'accept' ? 'Quotation accepted. We will contact you about the next steps.' : 'Quotation declined.';
          this.decisionMessage.set(message); this.toast.show(message);
        },
        error: () => { if (this.token() !== token) return; this.uncertain(); },
      });
  }
  private uncertain(): void { this.processing.set(false); this.needsReload.set(true); this.decisionMessage.set('We could not confirm your response. Reload this quotation to check its current status before trying again.'); }
}
