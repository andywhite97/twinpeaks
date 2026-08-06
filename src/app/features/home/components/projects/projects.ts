import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageProject } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-projects-section',
  imports: [RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  @Input() projects: HomepageProject[] = [];
}
