import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  getAccessToken(): string | null {
    return this.storage?.getItem('access_token') ?? null;
  }

  getRefreshToken(): string | null {
    return this.storage?.getItem('refresh_token') ?? null;
  }

  setTokens(access: string, refresh: string) {
    this.storage?.setItem('access_token', access);
    this.storage?.setItem('refresh_token', refresh);
  }

  clearTokens() {
    this.storage?.removeItem('access_token');
    this.storage?.removeItem('refresh_token');
  }

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }
}
