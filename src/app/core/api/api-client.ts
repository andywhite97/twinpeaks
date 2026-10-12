import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, finalize, timeout } from 'rxjs';
import { LoadingStore } from '../state/loading-store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly loading = inject(LoadingStore);
  url(endpoint: string): string { return `${environment.apiUrl}/${endpoint}`; }
  get<T>(endpoint: string, privateDocument = false) {
    return defer(() => {
      const finish = this.loading.begin();
      return this.http.get<T>(this.url(endpoint), { referrer: '', cache: privateDocument ? 'no-store' : 'default' })
        .pipe(timeout(environment.requestTimeout), finalize(finish));
    });
  }
  post<T>(endpoint: string, body: unknown) {
    return defer(() => {
      const finish = this.loading.begin();
      return this.http.post<T>(this.url(endpoint), body, { referrer: '', cache: 'no-store' })
        .pipe(timeout(environment.requestTimeout), finalize(finish));
    });
  }
}
