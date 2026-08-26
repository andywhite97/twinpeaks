import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { HomepageStatistic } from '../../../../shared/models/homepage.model';

@Component({
  standalone: true,
  selector: 'app-statistics-section',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnDestroy {
  private statisticItems: HomepageStatistic[] = [];
  private displayedValues = new Map<number, string>();
  private animationTimer?: number;

  constructor(private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: object) {}

  @Input() set statistics(value: HomepageStatistic[] | null | undefined) {
    this.statisticItems = value ?? [];
    this.animateCounters();
  }
  get statistics(): HomepageStatistic[] { return this.statisticItems; }
  ngOnDestroy(): void { if (this.animationTimer && isPlatformBrowser(this.platformId)) window.clearInterval(this.animationTimer); }

  displayValue(statistic: HomepageStatistic): string { return this.displayedValues.get(statistic.id) ?? statistic.value; }

  private animateCounters(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.displayedValues = new Map(this.statistics.map((statistic) => [statistic.id, statistic.value]));
      return;
    }
    if (this.animationTimer) window.clearInterval(this.animationTimer);
    const targets = this.statistics.map((statistic) => ({ statistic, value: Number(statistic.value) })).filter((item) => Number.isFinite(item.value));
    this.displayedValues = new Map(this.statistics.map((statistic) => [statistic.id, statistic.value]));
    if (!targets.length) return;
    const startTime = performance.now();
    const duration = 900;
    this.animationTimer = window.setInterval(() => {
      const progress = Math.min((performance.now() - startTime) / duration, 1);
      this.displayedValues = new Map(targets.map(({ statistic, value }) => [statistic.id, Math.round(value * progress).toString()]));
      this.cdr.markForCheck();
      if (progress === 1 && this.animationTimer) { window.clearInterval(this.animationTimer); this.animationTimer = undefined; }
    }, 16);
  }
}
