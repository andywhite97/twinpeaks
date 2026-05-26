import { Component, OnInit } from '@angular/core';
import { Leader } from '../../../shared/models/leader.model';
import { LeadershipService } from '../leadership-service';
import { RouterLink } from '@angular/router';
import { CompanyProfileService } from '../../../core/services/company-profile';
import { CompanyProfile } from '../../../shared/models/company-profile.model';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-leadership-list',
  imports: [RouterLink, PageHeader],
  templateUrl: './leadership-list.html',
  styleUrl: './leadership-list.css',
})
export class LeadershipList implements OnInit {

  leaders: Leader[] = [];
  companyProfile?: CompanyProfile;
  isLoading = true;
  hasError = false;

  constructor(
    private leadershipService: LeadershipService,
    private companyProfileService: CompanyProfileService,
  ) {}

  ngOnInit(): void {
    this.companyProfileService.getCompanyProfile().subscribe({
      next: (profile) => {
        this.companyProfile = profile;
      },
    });

    this.leadershipService.getLeaders().subscribe({
      next: (data) => {
        this.leaders = data;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
