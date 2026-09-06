import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification.service';
import { QuotationService } from '../../../core/services/quotation';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ProductService } from '../../products/product';
import { Services } from '../../services';
import { Product } from '../../../shared/models/product.model';
import { Service } from '../../../shared/models/services.model';

@Component({ selector: 'app-request-quote', imports: [ReactiveFormsModule, PageHeader], templateUrl: './request-quote.html', styleUrl: './request-quote.css' })
export class RequestQuote implements OnInit {
  customRequirement = signal('');
  isSubmitting = signal(false);
  isPickerOpen = signal(false);
  products = signal<Product[]>([]);
  services = signal<Service[]>([]);
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    company_name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{8,15}$/)] }),
    address: new FormControl('', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true }),
  });

  constructor(
    private api: ApiService,
    private notifications: NotificationService,
    private quotationService: QuotationService,
    private productService: ProductService,
    private servicesService: Services,
  ) {}

  get basket() { return this.quotationService.items; }

  ngOnInit(): void {
    this.productService.getProducts(1, 6).subscribe({ next: (response) => this.products.set(response.results) });
    this.servicesService.getServices().subscribe({ next: (services) => this.services.set(services) });
  }

  addRequirement(): void { this.quotationService.addCustomRequirement(this.customRequirement()); this.customRequirement.set(''); }
  togglePicker(): void { this.isPickerOpen.update((isOpen) => !isOpen); }
  addProduct(product: Product): void { this.quotationService.addProduct(product); this.isPickerOpen.set(false); this.notifications.success(`${product.name} added to your quote.`); }
  addService(service: Service): void { this.quotationService.addService(service); this.isPickerOpen.set(false); this.notifications.success(`${service.title} added to your quote.`); }
  updateQuantity(key: string, quantity: number): void { this.quotationService.updateQuantity(key, quantity); }
  remove(key: string): void { this.quotationService.remove(key); }

  submit(): void {
    if (this.form.invalid || !this.basket().length) { this.form.markAllAsTouched(); if (!this.basket().length) this.notifications.info('Add at least one item or requirement to request a quote.'); return; }
    this.isSubmitting.set(true);
    const items = this.basket().map(({ key, title, ...item }) => item);
    this.api.post<{ quote_number: string }>('quotations/', { ...this.form.getRawValue(), items }).subscribe({
      next: (result) => { this.isSubmitting.set(false); this.quotationService.clear(); this.form.reset(); this.notifications.success(`Quote request ${result.quote_number} has been sent.`); },
      error: () => { this.isSubmitting.set(false); this.notifications.error('We could not send your quote request. Please try again.'); },
    });
  }
}
