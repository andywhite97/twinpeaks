import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { CompanyProfile } from '../../shared/models/company-profile.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  constructor(private api: ApiService) {}

  getCompanyProfile() {
    return this.api.get<CompanyProfile>('company/');
  }
}
