import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-dress-reports',
  standalone: false,
  templateUrl: './dress-reports.component.html',
  styleUrl: './dress-reports.component.scss'
})
export class DressReportsComponent {
reports: any[] = [];
  startDate: string = '';
  endDate: string = '';
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getReport('today');
  }


getReport(period: string): void {
  let endPoint = `cloth-sales-reports?period=${period}`;

  if (period === 'custom' && this.startDate && this.endDate) {
    endPoint += `&startDate=${this.startDate}&endDate=${this.endDate}`;
  }

  this.dataService.getClothsReports(endPoint).subscribe({
    next: (data) => {
      this.reports = data;
    },
    error: (err) => {
      console.error('Error fetching report:', err);
      this.reports = [];
    }
  });
}

}
