import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  url(endpoint: string): string { return `${environment.apiUrl}/${endpoint}`; }
  get<T>(endpoint: string, privateDocument = false) {
    return this.http.get<T>(this.url(endpoint), { referrer: '', cache: privateDocument ? 'no-store' : 'default' })
      .pipe(timeout(environment.requestTimeout));
  }
  post<T>(endpoint: string, body: unknown) {
    return this.http.post<T>(this.url(endpoint), body, { referrer: '', cache: 'no-store' }).pipe(timeout(environment.requestTimeout));
  }
}
