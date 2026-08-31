import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

interface PublicQuotationItem { title: string; description: string; quantity: number; unit_price?: string; line_total?: string; }
interface PublicQuotationData {
  quote_number: string; name: string; company_name: string; message: string; status: string;
  currency: string; valid_until: string | null; subtotal?: string; discount_amount?: string; tax_amount?: string; total?: string;
  items?: PublicQuotationItem[]; terms?: string;
}

@Component({
  selector: 'app-public-quotation',
  imports: [PageHeader, RouterLink],
  templateUrl: './public-quotation.html',
  styleUrl: './public-quotation.css',
})
export class PublicQuotation implements OnInit {
  quotation = signal<PublicQuotationData | null>(null);
  loading = signal(true);
  error = signal('');
  processing = signal(false);
  private token = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private notifications: NotificationService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) { this.error.set('This quotation link is invalid.'); this.loading.set(false); return; }
    this.load();
  }

  decide(decision: 'accept' | 'decline'): void {
    this.processing.set(true);
    this.api.post<PublicQuotationData>(`quotations/public/${this.token}/${decision}/`, {}).subscribe({
      next: (quotation) => { this.quotation.set(quotation); this.processing.set(false); this.notifications.success(decision === 'accept' ? 'Quotation accepted. We will contact you about next steps.' : 'Quotation declined.'); },
      error: () => { this.processing.set(false); this.notifications.error('We could not update this quotation. Please try again.'); },
    });
  }

  downloadPdf(): void { window.open(this.api.url(`quotations/public/${this.token}/pdf/`), '_blank', 'noopener'); }

  private load(): void {
    this.api.get<PublicQuotationData>(`quotations/public/${this.token}/`).subscribe({
      next: (quotation) => { this.quotation.set(quotation); this.loading.set(false); },
      error: () => { this.error.set('This quotation is unavailable or the link has expired.'); this.loading.set(false); },
    });
  }
}
