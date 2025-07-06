import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: false,
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {


  constructor(private http: HttpClient, private authService: AuthService) {}

  // Form fields
   ownerName: string = '';
  shopName: string = '';
  email: string = '';
  phone: string = '';
  shopAddress: string = '';
  city: string = '';
  pincode: string = '';
  password: string = '';

  register() {
    const registrationData = {
      ownerName: this.ownerName,
      shopName: this.shopName,
      email: this.email,
      phone: this.phone,
      shopAddress: this.shopAddress,
      city: this.city,
      pincode: this.pincode,
      password: this.password
    };
    this.authService.register(registrationData).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Registration error:', error);
      }
    });
  }
}
