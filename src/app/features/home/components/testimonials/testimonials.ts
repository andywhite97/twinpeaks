import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HomepageTestimonial } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-testimonials-section',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent {
  @Input() testimonials: HomepageTestimonial[] = [];
}
