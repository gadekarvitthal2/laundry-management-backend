import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCustomerComponent } from '../update-customer/update-customer.component';

@Component({
  selector: 'app-customer-details',
  standalone: false,
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private router: Router,
    private dialog: MatDialog
  ) {}
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  async ngOnInit(): Promise<void> {
    // Fetch all customers from the data service
    await this.getAllCustomers();
    await this.patchOrderInfo();
  }
  displayedColumns: string[] = [
    'index',
    'fullName',
    'phone',
    // 'email',
    'address',
    // 'createdAt',
    'bookingDate',
    // 'Amount',
    'placeOrderAt',
    // 'notifyCustomer',
    'actions',
  ];

  customers = ([] = []);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  placeOrder(customerId: string) {
    // Logic to place an order for the selected customer

    this.router.navigate(['/customer-registration'], {
      queryParams: { customerId: customerId },
    });
    // You can implement the order placement logic here
  }

  getAllCustomers() {
    return new Promise<void>((resolve, reject) => {
      this.dataService.getAllCustomers().subscribe(
        (data: any) => {
          this.customers = data;
          this.dataSource = new MatTableDataSource(this.customers);
          this.dataSource.paginator = this.paginator;
          resolve();
        },
        (error) => {
          console.error('Error fetching customer data', error);
          reject(error);
        }
      );
    });
  }

  patchOrderInfo() {
    return new Promise<void>((resolve, reject) => {
      this.dataService.updateOrderInfo().subscribe({
        next: (response) => {
          resolve();
        },
        error: (error) => {
          console.error('Error updating order info:', error);
          reject(error);
        },
      });
    });
  }

  deliverOrder(customerId: string, phone: string) {
    this.getAllCustomers();
    this.notifyCustomer(phone);
  }

// component.ts
confirmDelete(data: any) {
  console.log('data',data)
  if (confirm('Are you sure you want to delete this customer?')) {
    this.dataService.deleteCustomerById(data._id).subscribe({
      next: () => {
        alert('Customer deleted successfully');
        this.getAllCustomers(); // refresh list
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete customer');
      }
    });
  }
}


  notifyCustomer(phoneNo: string): void {
    if (!phoneNo) {
      alert('Phone number is missing.');
      return;
    }
    const message = `Your Order has been delivered.\n\nThank you!\nJay Drycleaners\nPlease visit again.`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`; // Add country code explicitly
    window.open(url, '_blank');
  }

  copyDeliveryMessage(): void {
    const message = `Your order has been delivered.\n\nThank you!\nJay Drycleaners\nPlease visit again.`;

    navigator.clipboard.writeText(message).then(
      () => alert('Message copied to clipboard!'),
      (err) => alert('Failed to copy message: ' + err)
    );
  }

  viewData(customerId: string) {
    // Logic to view details of the selected customer
    this.router.navigate(['/view-customer-details'], {
      queryParams: { customerId: customerId },
    });
  }

  openEditDialog(customer: any): void {
    const dialogRef = this.dialog.open(UpdateCustomerComponent, {
      width: '400px',
      data: { ...customer },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAllCustomers();
      }
    });
  }
}
