import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HomepageStatistic } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-statistics-section',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  @Input() statistics: HomepageStatistic[] = [];
}
