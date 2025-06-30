import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

@Component({
  selector: 'app-view-customer-detail',
  standalone: false,
  templateUrl: './view-customer-detail.component.html',
  styleUrl: './view-customer-detail.component.scss',
})
export class ViewCustomerDetailComponent {
  customerId: string | null = null;
  ordersData: any[] = [];
  displayedColumns: string[] = [
    'billNumber',
    'fullName',
    'address',
    'phone',
    'date',
    'action',
  ];
  constructor(
    private router: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog
  ) {
    this.router.queryParams.subscribe((params: any) => {
      this.customerId = params['customerId'];
      console.log('Customer ID:', this.customerId);
    });
  }

  async ngOnInit() {
    if (this.customerId) {
      await this.getOrderDetails();
      await this.getAllOrdersWithCustomers(this.customerId);
    } else {
      console.error('Customer ID is not available');
    }
  }

  getOrderDetails() {
    return new Promise((resolve, reject) => {
      this.dataService
        .getOrdersByCustomer(String(this.customerId))
        .subscribe((orders: any[]) => {
          resolve(orders);
          this.ordersData = orders.map((order) => ({
            ...order,
            fullName: order.customerId.fullName,
            address: order.customerId.address,
            phone: order.customerId.phone,
            isDelivered: order.customerId.isDelivered,
          }));
          console.log('Customer Orders:', orders);
        });
    });
  }

  getAllOrdersWithCustomers(customerId: string) {
    return new Promise((resolve, reject) => {
      this.dataService
        .getAllOrdersWithCustomerInfo(String(customerId))
        .subscribe(
          (data: any[]) => {
            console.log('Fetched orders with customer info:', data);
            resolve(data);
          },
          (error) => {
            console.error('Error fetching orders:', error);
            reject(error);
          }
        );
    });
  }


  viewOrders(order: any): void {
    this.dialog.open(OrderSummaryComponent, {
      width: '600px',
      height: '600px',
      // disableClose: true,
      data: order,
    });
  }
}
