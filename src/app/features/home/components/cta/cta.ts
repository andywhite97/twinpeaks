import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageHero } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-cta-section',
  imports: [RouterLink],
  templateUrl: './cta.html',
  styleUrl: './cta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaComponent {
  @Input() settings: HomepageHero | null = null;
}
