import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ApiClient } from '../../core/api/api-client';
@Component({ selector: 'app-subscription-action', imports: [RouterLink], styleUrl: './blog.scss', changeDetection: ChangeDetectionStrategy.OnPush,
 template: `<section class="container journal journal-state"><p class="eyebrow">TWINPEAKS NEWSLETTER</p><h1>{{ action() === 'confirm' ? 'Confirm your subscription' : 'Unsubscribe from the newsletter' }}</h1>@if (!token()) { <p>This link is missing its confirmation code. Please use the full link in your email.</p> } @else if (!done()) { <p>{{ action() === 'confirm' ? 'Confirm that you would like to receive TwinPeaks articles and occasional service updates.' : 'You can stop receiving newsletter emails below.' }}</p><button class="button button-primary" [disabled]="busy()" (click)="submit()">{{ busy() ? 'Please wait…' : action() === 'confirm' ? 'Confirm subscription' : 'Unsubscribe' }}</button> }<p role="status">{{ message() }}</p><a routerLink="/blog" class="text-link">Back to the journal →</a></section>` })
export class SubscriptionAction {
 private route = inject(ActivatedRoute); private api = inject(ApiClient); private destroy = inject(DestroyRef);
 private data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
 private fragment = toSignal(this.route.fragment, { initialValue: this.route.snapshot.fragment });
 readonly action = computed(() => this.data()['action'] === 'unsubscribe' ? 'unsubscribe' : 'confirm');
 readonly token = computed(() => new URLSearchParams(this.fragment() ?? '').get('token') ?? '');
 readonly busy = signal(false); readonly done = signal(false); readonly message = signal('');
 submit() { if (this.busy() || !this.token()) return; this.busy.set(true);
   this.api.post<{ message: string }>(`newsletter/${this.action()}/`, { token: this.token() }).pipe(takeUntilDestroyed(this.destroy)).subscribe({ next: result => { this.busy.set(false); this.done.set(true); this.message.set(result.message); }, error: error => { this.busy.set(false); this.message.set(error.error?.message || 'We couldn’t process your request. Please try again later.'); } });
 }
}
