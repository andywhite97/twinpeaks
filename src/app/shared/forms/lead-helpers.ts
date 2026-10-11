import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { ParamMap } from '@angular/router';
import { SOLUTIONS } from '../../features/home/solution-categories';

export const meaningful = (minimum = 2): ValidatorFn => control => typeof control.value === 'string' && control.value.trim().length >= minimum ? null : { meaningful: true };
export const nameValidators = [Validators.required, meaningful(), Validators.maxLength(120)];
export const emailValidators = [Validators.required, Validators.email, Validators.maxLength(254)];
export function phoneDigits(value: string): string { return value.replace(/[\s()+-]/g, ''); }
export const validPhone: ValidatorFn = control => /^\+?[\d\s()-]+$/.test(control.value) && /^\d{8,15}$/.test(phoneDigits(control.value)) ? null : { phone: true };
export function fieldError(control: AbstractControl, submitted: boolean): string {
  if (!(control.touched || submitted) || !control.errors) return '';
  if (control.hasError('server')) return 'The server rejected this field. Check the value and try again.';
  if (control.hasError('email')) return 'Enter a valid email address.';
  if (control.hasError('phone')) return 'Enter 8–15 digits. Spaces, brackets and a leading + are allowed.';
  if (control.hasError('maxlength')) return `Use no more than ${control.errors['maxlength'].requiredLength} characters.`;
  if (control.hasError('date')) return 'Choose a valid date today or later.';
  return 'Complete this field with a valid value.';
}
export function approvedCopy(value: string | null | undefined): string {
  const copy = value?.trim() ?? '';
  return /^(coming\s+soon[.!]?|tbd|todo|placeholder)$/i.test(copy) ? '' : copy;
}
export function enquiryContext(params: ParamMap) {
  const solution = SOLUTIONS.find(item => item.slug === params.get('solution'));
  const raw = params.get('project') ?? '';
  return { solution, assessment: params.get('enquiry') === 'site-assessment', project: /^[a-zA-Z0-9_-]{1,140}$/.test(raw) ? raw : '' };
}
export function whatsappHref(value: string | undefined): string | null {
  const digits = phoneDigits(value ?? '');
  return /^\+?[\d\s()-]+$/.test(value ?? '') && /^\d{8,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
}
export const preferredDate: ValidatorFn = control => {
  if (!control.value) return null;
  const value: string = control.value;
  const date = new Date(value + 'T00:00:00Z');
  const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= today ? null : { date: true };
};
