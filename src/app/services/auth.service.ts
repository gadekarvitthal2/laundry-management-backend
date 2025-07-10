import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private baseUrl = 'http://localhost:5000/api/auth';
  // private baseUrl = environment.apiUrl;
  private baseUrl = 'https://laundry-management-cfnd.onrender.com/api/auth';


  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }


  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Logout function
  logout(): void {
    localStorage.removeItem('token');
  }

  // Get the token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
