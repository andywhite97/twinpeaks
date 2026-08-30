import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Service } from '../../../shared/models/services.model';
import { Services } from '../../services';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-service-list',
  imports: [RouterLink, PageHeader, Loader],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceList implements OnInit {
  private readonly serviceIcons = [
    './img/line-icons/icons/fountain-pen.svg',
    './img/line-icons/icons/light-bulb.svg',
    './img/line-icons/icons/users.svg',
    './img/line-icons/monitor-3.svg',
    './img/line-icons/customer-service.svg',
    './img/line-icons/pricing-rocket.svg',
  ];

  services: Service[] = [];
  isLoading = true;
  hasError = false;

  constructor(
    private serviceService: Services,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.serviceService.getServices()
      .pipe(timeout(10000)) // 10 second timeout
      .subscribe({
        next: (data) => {
          this.services = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  getServiceIcon(service: Service, index: number): string {
    return service.icon || this.serviceIcons[index % this.serviceIcons.length];
  }

}
