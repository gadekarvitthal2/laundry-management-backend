import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-sale-report',
  standalone: false,
  templateUrl: './sale-report.component.html',
  styleUrl: './sale-report.component.scss',
})
export class SaleReportComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'index',
    'customerName',
    'serviceType',
    'amount',
    'createdAt',
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getOrders('today');
  }

  getOrders(range: string) {
    this.dataService.getOrdersByRange(range).subscribe((data: any[]) => {
      this.dataSource.data = data;
    });
  }

  getTotalAmount(): number {
    return this.dataSource?.data.reduce(
      (sum: number, row: { charges: { totalAmount: number } }) =>
        sum + (row.charges?.totalAmount || 0),
      0
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const customer = data.customerId?.fullName || '';
      const service = data.serviceType || '';
      const date = new Date(data.createdAt).toLocaleDateString('en-GB');
      return (
        customer.toLowerCase().includes(filter) ||
        service.toLowerCase().includes(filter) ||
        date.includes(filter)
      );
    };

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
