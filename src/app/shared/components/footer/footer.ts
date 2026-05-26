import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyProfileService } from '../../../core/services/company-profile';
import { CompanyProfile } from '../../models/company-profile.model';

interface SocialLink {
  label: string;
  url: string;
  iconClass: string;
  spacingClass: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  currentYear = new Date().getFullYear();
  mission = signal('Our mission is to deliver optimal solutions with quality and services at reasonable prices.');
  socialLinks = signal<SocialLink[]>([]);

  constructor(private companyProfileService: CompanyProfileService) {}

  ngOnInit(): void {
    this.companyProfileService.getCompanyProfile().subscribe({
      next: (profile) => {
        if (profile?.mission) {
          this.mission.set(profile.mission);
        }

        this.socialLinks.set(this.buildSocialLinks(profile));
      },
      error: () => {
        this.mission.set(this.mission());
      },
    });
  }

  private buildSocialLinks(profile: CompanyProfile): SocialLink[] {
    const socialLinks: Array<Omit<SocialLink, 'url'> & { url?: string | null }> = [
      {
        label: 'Facebook',
        url: profile.facebook,
        iconClass: 'fab fa-facebook-f',
        spacingClass: 'pe-2',
      },
      {
        label: 'Twitter',
        url: profile.twitter,
        iconClass: 'fab fa-twitter',
        spacingClass: 'px-2',
      },
      {
        label: 'Instagram',
        url: profile.instagram,
        iconClass: 'fab fa-instagram',
        spacingClass: 'px-2',
      },
      {
        label: 'LinkedIn',
        url: profile.linkedin,
        iconClass: 'fab fa-linkedin-in',
        spacingClass: 'px-2',
      },
    ];

    return socialLinks
      .filter((link) => Boolean(link.url))
      .map((link) => ({
        ...link,
        url: link.url as string,
      }));
  }
}
