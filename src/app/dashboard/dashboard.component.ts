import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  address: any;
  constructor(private router: Router, private dataService: DataService) {}
  ngOnInit(): void {
    this.address = localStorage.getItem('address');
  }
  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
