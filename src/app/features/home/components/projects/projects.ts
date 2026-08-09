import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptimizedImagePipe } from '../../../../shared/pipes/optimized-image.pipe';
import { HomepageProject } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-projects-section',
  imports: [RouterLink, OptimizedImagePipe],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  @Input() projects: HomepageProject[] = [];

  isExternalLink(url?: string): boolean {
    return Boolean(url && /^(https?:)?\/\//i.test(url));
  }

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'https://placehold.co/600x400?text=Project';
  }
}
