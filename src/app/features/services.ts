import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api';
import { Service } from '../shared/models/services.model';

@Injectable({
  providedIn: 'root',
})
export class Services {
  
  constructor(private api: ApiService) {}

  getServices() {
    return this.api.get<Service[]>('services/');
  }
  
}
