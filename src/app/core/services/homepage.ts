import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { HomepageSectionData } from '../../shared/models/homepage.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly homepageUrl = `${environment.apiUrl}/homepage/`;
  private readonly http: HttpClient;
  private readonly homepageData$: Observable<HomepageSectionData>;

  constructor(http: HttpClient) {
    this.http = http;
    this.homepageData$ = this.http.get<HomepageSectionData>(this.homepageUrl).pipe(shareReplay(1));
  }

  getHomepageData(): Observable<HomepageSectionData> {
    return this.http.get<any>(this.homepageUrl).pipe(
      map((data) => ({
        hero: data?.hero ?? {},
        statistics: data?.statistics ?? [],
        featured_products: data?.featured_products ?? [],
        solutions: data?.solutions ?? [],
        projects: data?.projects ?? [],
        brands: data?.brands ?? [],
        testimonials: data?.testimonials ?? [],
        settings: data?.settings ?? data?.hero ?? {},
      })),
      shareReplay(1),
    );
  }
}
