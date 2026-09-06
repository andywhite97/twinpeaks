import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeader } from '../../shared/components/page-header/page-header';

@Component({ selector: 'app-contact', imports: [ReactiveFormsModule, PageHeader], templateUrl: './contact.html', styleUrl: './contact.css' })
export class Contact {
  contactForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  isSubmitting = signal(false);

  constructor(private api: ApiService, private notifications: NotificationService) {}

  submitContactForm(): void {
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.api.post('contact/', this.contactForm.getRawValue()).subscribe({
      next: () => { this.contactForm.reset(); this.isSubmitting.set(false); this.notifications.success('Your message has been sent.'); },
      error: () => { this.isSubmitting.set(false); this.notifications.error('We could not send your message. Please try again.'); },
    });
  }
}
