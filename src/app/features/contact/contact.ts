import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { PageHeader } from '../../shared/components/page-header/page-header';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, PageHeader],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isSubmitting = signal(false);
  submitStatus = signal<'idle' | 'success' | 'error'>('idle');

  constructor(private api: ApiService) {}

  submitContactForm(): void {
    this.submitStatus.set('idle');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.api.post<ContactMessage>('contact/', this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.contactForm.reset();
        this.submitStatus.set('success');
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitStatus.set('error');
        this.isSubmitting.set(false);
      },
    });
  }

}
