import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../products/product';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { QuotationService } from '../../core/services/quotation';

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
export class Contact implements OnInit {
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
    phone_number: new FormControl('', { nonNullable: true }),
  });

  isSubmitting = signal(false);
  submitStatus = signal<'idle' | 'success' | 'error'>('idle');
  readonly isQuote = signal(false);
  readonly quoteProductSlug = signal<string | null>(null);
  readonly quoteProductName = signal('');
  readonly quoteProductId = signal<number | null>(null);

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private productService: ProductService,
    private notifications: NotificationService,
    private quotationService: QuotationService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const productSlug = params.get('product');
      const quoteMode = params.get('quote') === 'true' || Boolean(productSlug);
      this.isQuote.set(quoteMode);
      this.quoteProductSlug.set(productSlug);
      this.quoteProductName.set('');
      this.quoteProductId.set(null);

      const phoneControl = this.contactForm.controls.phone_number;
      if (quoteMode) phoneControl.setValidators([Validators.required, Validators.pattern(/^\d{8,15}$/)]);
      else phoneControl.clearValidators();
      phoneControl.updateValueAndValidity({ emitEvent: false });

      if (productSlug) {
        this.productService.getProduct(productSlug).subscribe({
          next: (product) => {
            this.quoteProductName.set(product.name);
            this.quoteProductId.set(product.id);
            this.quotationService.addProduct(product);
          },
        });
      }
    });
  }

  get quoteBasket() { return this.quotationService.items; }

  submitContactForm(): void {
    this.submitStatus.set('idle');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.contactForm.getRawValue();
    const endpoint = this.isQuote() ? 'quotations/' : 'contact/';
    const quoteItems = this.quoteBasket().map(({ key, title, ...item }) => item);
    const payload = this.isQuote()
      ? { ...formValue, items: quoteItems.length ? quoteItems : [{ description: formValue.message, quantity: 1 }] }
      : { name: formValue.name, email: formValue.email, message: formValue.message };

    this.api.post<ContactMessage>(endpoint, payload).subscribe({
      next: () => {
        this.contactForm.reset();
        if (this.isQuote()) this.quotationService.clear();
        this.submitStatus.set('success');
        this.notifications.success(this.isQuote() ? 'Your quote request has been sent.' : 'Your message has been sent.');
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitStatus.set('error');
        this.notifications.error(this.isQuote() ? 'We could not send your quote request. Please try again.' : 'We could not send your message. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  updateQuoteItem(key: string, quantity: number): void { this.quotationService.updateQuantity(key, quantity); }
  removeQuoteItem(key: string): void { this.quotationService.remove(key); }

}
