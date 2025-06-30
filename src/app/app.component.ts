import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found:');
    } else {
      // Redirect to login page
      this.router.navigate(['/login']);
    }
  }
  title = 'laundry-new';
}
