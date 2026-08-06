import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageHero } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-hero-section',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  @Input() hero: HomepageHero | null = null;
}
