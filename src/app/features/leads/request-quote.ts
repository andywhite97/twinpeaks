import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { QuotationApi } from '../../core/api/quotation-api';
import { QuotationRequest } from '../../core/api/contracts';
import { PageHeader } from '../../shared/ui/headings';
import { FormField, Confirmation, SubmissionFeedback, FormFocus } from '../../shared/forms/form-ui';
import { CompanyContact } from '../../shared/forms/company-contact';
import { Submission } from '../../shared/forms/submission';
import { emailValidators, fieldError, meaningful, nameValidators, phoneDigits, preferredDate, validPhone } from '../../shared/forms/lead-helpers';
import { SOLUTIONS } from '../home/solution-categories';
import { LeadContext } from './lead-context';

@Component({ selector: 'app-request-quote', imports: [ReactiveFormsModule, RouterLink, PageHeader, FormField, Confirmation, SubmissionFeedback, CompanyContact], templateUrl: './request-quote.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class RequestQuote {
  private api = inject(QuotationApi); readonly context = new LeadContext(); readonly submission = new Submission(); readonly solutions = SOLUTIONS;
  readonly attempted = signal(false); readonly reviewing = signal(false); readonly reference = signal('');
  private readonly focus = new FormFocus();
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: nameValidators }), email: new FormControl('', { nonNullable: true, validators: emailValidators }), phone: new FormControl('', { nonNullable: true, validators: [Validators.required, validPhone] }),
    customerType: new FormControl('individual', { nonNullable: true, validators: Validators.pattern(/^(individual|business)$/) }), company: new FormControl('', { nonNullable: true, validators: Validators.maxLength(150) }),
    categories: new FormArray(SOLUTIONS.map(solution => new FormControl(solution.slug === this.context.value.solution?.slug, { nonNullable: true })), { validators: control => control.value.some((value: boolean) => value === true) ? null : { required: true } }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, meaningful(20), Validators.maxLength(3000)] }), location: new FormControl('', { nonNullable: true, validators: [Validators.required, meaningful(), Validators.maxLength(1000)] }),
    budget: new FormControl('', { nonNullable: true, validators: Validators.maxLength(80) }), timeline: new FormControl('', { nonNullable: true, validators: Validators.maxLength(120) }), date: new FormControl('', { nonNullable: true, validators: preferredDate }), consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  readonly serverFields = signal<Array<keyof typeof this.form.controls>>([]);
  constructor() {
    this.context.listen(() => { if (this.form.pristine) this.form.controls.categories.setValue(this.solutions.map(solution => solution.slug === this.context.value.solution?.slug)); });
    const destroy = inject(DestroyRef);
    for (const [key, control] of Object.entries(this.form.controls)) { const changes: Observable<unknown> = control.valueChanges; changes.pipe(takeUntilDestroyed(destroy)).subscribe(() => this.serverFields.update(fields => fields.filter(field => field !== key))); }
    this.form.controls.customerType.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(type => {
      this.form.controls.company.setValidators(type === 'business' ? [Validators.required, meaningful(), Validators.maxLength(150)] : [Validators.maxLength(150)]);
      this.form.controls.company.updateValueAndValidity();
    });
  }
  error(key: keyof typeof this.form.controls): string { return this.serverFields().includes(key) ? 'The server rejected this field. Check the value and try again.' : fieldError(this.form.controls[key], this.attempted()); }
  selectedTitles(): string[] { return this.solutions.filter((_, index) => this.form.controls.categories.at(index).value).map(solution => solution.title); }
  review(): void {
    if (['pending', 'success'].includes(this.submission.state()) || this.context.pending()) return;
    this.attempted.set(true); this.form.markAllAsTouched();
    if (this.form.valid && !this.serverFields().length) { this.reviewing.set(true); this.focus.move('.form-panel h2'); }
    else this.focus.move('[aria-invalid="true"]');
  }
  edit(): void { this.reviewing.set(false); this.focus.move('#quote-name'); }
  payload(): QuotationRequest {
    const value = this.form.getRawValue();
    return { name: value.name.trim(), email: value.email.trim(), phone_number: phoneDigits(value.phone), company_name: value.customerType === 'business' ? value.company.trim() : '', address: value.location.trim(),
      message: [`Customer type: ${value.customerType}`, this.context.text(), `Project description: ${value.description.trim()}`, value.budget.trim() ? `Budget (customer supplied): ${value.budget.trim()}` : '', value.timeline.trim() ? `Expected timeline (requested): ${value.timeline.trim()}` : '', value.date ? `Preferred site assessment date: ${value.date} (request, not a booking)` : '', 'Contact permission: customer agreed to be contacted about this request.'].filter(Boolean).join('\n'),
      items: this.selectedTitles().map(title => ({ description: `Requested solution category: ${title}. Scope subject to consultation and confirmation.`, quantity: 1 })),
    };
  }
  submit(): void {
    if (!this.reviewing() || this.submission.blocked() || this.context.pending()) return;
    if (this.form.invalid) { this.reviewing.set(false); return; }
    const payload = this.payload();
    if ((payload.message?.length ?? 0) > 4000) { this.form.controls.description.setErrors({ server: true }); this.reviewing.set(false); return; }
    this.submission.send(() => this.api.requestQuotation(payload), response => !!response && response.status === 'requested' && /^TP-Q-\d{4}-\d{4,}$/.test(response.quote_number) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.public_access_token), response => { this.reference.set(response.quote_number); this.form.reset(); }, fields => {
      const mapping: Record<string, keyof typeof this.form.controls> = { name: 'name', email: 'email', phone_number: 'phone', company_name: 'company', address: 'location', message: 'description', items: 'categories' };
      this.serverFields.set(fields.filter(field => Object.hasOwn(mapping, field)).map(field => mapping[field]!).filter((key): key is keyof typeof this.form.controls => !!key));
      this.reviewing.set(false);
      this.focus.move('[aria-invalid="true"]');
    });
  }
}
