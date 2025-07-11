import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isLoading = false;

  constructor(private router: Router, private loaderService: LoaderService) {
    this.loaderService.isLoading$.subscribe((val) => {
      this.isLoading = val;
    });
  }
  
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
