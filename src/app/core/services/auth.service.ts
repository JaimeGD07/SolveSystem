/**
 * Responsabilidades:
 * almacenar token
 * exponer signal readonly
 * login()
 * logout()
 * isAuthenticated()
 */
import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'solve_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());

  login(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }
}
