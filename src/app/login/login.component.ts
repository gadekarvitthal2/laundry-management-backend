import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        alert(res.message);
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: err => alert(err.error.message)
    });
  }
}
