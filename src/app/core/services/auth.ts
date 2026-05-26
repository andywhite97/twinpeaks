import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenService } from './token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login/`, {
      email,
      password
    });
  }

  logout() {
    this.tokenService.clearTokens();
  }
}
