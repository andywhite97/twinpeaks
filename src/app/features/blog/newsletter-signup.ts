import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiClient } from '../../core/api/api-client';
import { SolutionsApi } from '../../core/api/content-api';
import { SolutionDto } from '../../core/api/contracts';

@Component({ selector: 'app-newsletter-signup', imports: [ReactiveFormsModule], styleUrl: './blog.scss', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="newsletter" aria-labelledby="newsletter-heading"><div><p class="eyebrow">THE TWINPEAKS NEWSLETTER</p><h2 id="newsletter-heading">A little insight.<br>A smarter next step.</h2><p>Practical articles and occasional service updates, delivered to your inbox.</p></div><form [formGroup]="form" (ngSubmit)="submit()"><label for="newsletter-email">Email address</label><div class="signup-row"><input id="newsletter-email" type="email" autocomplete="email" formControlName="email" placeholder="you@example.com" required maxlength="254"><button class="button button-primary" [disabled]="busy()">{{ busy() ? 'Submitting…' : 'Subscribe' }}</button></div>@if (attempted() && form.controls.email.invalid) { <p class="form-error" role="alert">Enter a valid email address.</p> }@if (solutions().length) { <details><summary>Choose your interests (optional)</summary><div class="interest-options">@for (solution of solutions(); track solution.id) { <label><input type="checkbox" [checked]="interests().includes(solution.id)" (change)="toggle(solution.id)">{{ solution.title }}</label> }</div></details> }<label class="consent"><input type="checkbox" formControlName="consent" required><span>I agree to receive TwinPeaks articles and occasional service updates by email. I can unsubscribe at any time.</span></label>@if (attempted() && form.controls.consent.invalid) { <p class="form-error" role="alert">Please agree to receive the newsletter.</p> }<p class="signup-note">Your email is used for this newsletter. Confirm your subscription using the link we email you.</p>@if (message()) { <p role="status" class="signup-result">{{ message() }}</p> }</form></section>` })
export class NewsletterSignup {
  readonly source = input<'blog' | 'article'>('blog');
  private api = inject(ApiClient); private destroy = inject(DestroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({ email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]], consent: [false, Validators.requiredTrue] });
  readonly busy = signal(false); readonly attempted = signal(false); readonly message = signal('');
  readonly solutions = signal<SolutionDto[]>([]); readonly interests = signal<number[]>([]);
  constructor() { inject(SolutionsApi).getSolutions().pipe(takeUntilDestroyed(this.destroy)).subscribe({ next: data => this.solutions.set(data), error: () => {} }); }
  toggle(id: number) { this.interests.update(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]); }
  submit() {
    if (this.busy()) return;
    this.attempted.set(true); this.message.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    this.api.post<{ message: string }>('newsletter/subscribe/', { ...this.form.getRawValue(), interests: this.interests(), source: this.source() }).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: result => { this.message.set(result.message); this.busy.set(false); this.form.reset(); this.interests.set([]); this.attempted.set(false); },
      error: error => { this.busy.set(false); this.message.set(error.status === 429 ? 'Too many attempts. Please try again later.' : 'We couldn’t submit your subscription. Please try again.'); },
    });
  }
}
