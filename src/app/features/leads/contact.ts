import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactApi } from '../../core/api/content-api';
import { PageHeader } from '../../shared/ui/headings';
import { FormField, Confirmation, SubmissionFeedback, FormFocus } from '../../shared/forms/form-ui';
import { CompanyContact } from '../../shared/forms/company-contact';
import { Submission } from '../../shared/forms/submission';
import { emailValidators, fieldError, meaningful, nameValidators, phoneDigits, validPhone } from '../../shared/forms/lead-helpers';
import { SOLUTIONS } from '../home/solution-categories';
import { LeadContext } from './lead-context';

@Component({ selector: 'app-contact', imports: [ReactiveFormsModule, RouterLink, PageHeader, FormField, Confirmation, SubmissionFeedback, CompanyContact], templateUrl: './contact.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class Contact {
  private api = inject(ContactApi); readonly context = new LeadContext(); readonly submission = new Submission(); readonly solutions = SOLUTIONS;
  readonly attempted = signal(false);
  private readonly focus = new FormFocus();
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: nameValidators }), email: new FormControl('', { nonNullable: true, validators: emailValidators }), phone: new FormControl('', { nonNullable: true, validators: [Validators.required, validPhone] }), company: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }), service: new FormControl(this.context.value.solution?.slug ?? 'general', { nonNullable: true }), message: new FormControl('', { nonNullable: true, validators: [Validators.required, meaningful(10), Validators.maxLength(4000)] }), consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }) });
  constructor() { this.context.listen(() => { if (this.form.pristine) this.form.controls.service.setValue(this.context.value.solution?.slug ?? 'general'); }); }
  error(key: keyof typeof this.form.controls): string { return fieldError(this.form.controls[key], this.attempted()); }
  submit(): void {
    if (this.submission.blocked() || this.context.pending()) return;
    this.attempted.set(true); this.form.markAllAsTouched();
    if (this.form.invalid) { this.focus.move('[aria-invalid="true"]'); return; }
    const value = this.form.getRawValue(); const service = SOLUTIONS.find(item => item.slug === value.service);
    if (value.service !== 'general' && !service) { this.form.controls.service.setErrors({ server: true }); return; }
    const request = { name: value.name.trim(), email: value.email.trim(), message: [`Phone: ${phoneDigits(value.phone)}`, value.company.trim() ? `Company: ${value.company.trim()}` : '', `Solution of interest: ${service?.title ?? 'General enquiry'}`, this.context.text(), '', value.message.trim(), '', 'Contact permission: customer agreed to be contacted about this enquiry.'].filter(Boolean).join('\n') };
    this.submission.send(() => this.api.sendEnquiry(request), response => !!response && Number.isInteger(response.id) && response.id > 0 && typeof response.created_at === 'string' && !Number.isNaN(Date.parse(response.created_at)), () => this.form.reset(), fields => { for (const field of fields) { if (Object.hasOwn(this.form.controls, field)) this.form.controls[field as keyof typeof this.form.controls].setErrors({ server: true }); } this.focus.move('[aria-invalid="true"]'); });
  }
}
