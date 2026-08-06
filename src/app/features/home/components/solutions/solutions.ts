import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
export class SolutionsComponent {
  @Input() solutions: HomepageSolution[] = [];
}
