import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HomepageBrand } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-brands-section',
  imports: [],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandsComponent {
  @Input() brands: HomepageBrand[] = [];
}
