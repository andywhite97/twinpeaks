import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageSolution } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-solutions-section',
  imports: [RouterLink],
  templateUrl: './solutions.html',
  styleUrl: './solutions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsComponent implements AfterViewInit {
  @Input() solutions: HomepageSolution[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.document.getElementById('fontawesome-solutions')) return;
    const script = this.document.createElement('script');
    script.id = 'fontawesome-solutions';
    script.src = './vendors/fontawesome/all.min.js';
    script.defer = true;
    this.document.body.appendChild(script);
  }

  isImageIcon(icon?: string): boolean { return Boolean(icon && /^(https?:)?\/\//.test(icon)); }
}
