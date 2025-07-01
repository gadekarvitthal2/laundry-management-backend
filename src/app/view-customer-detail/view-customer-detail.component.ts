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
  allConsumerList: any[] = [];
  displayedColumns: string[] = [
    'billNumber',
    'fullName',
    'address',
    'phone',
    'date',
    'whatspp_delivered_date',
    'Delivered',
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
      await this.getAllCustomers();
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
            isDelivered: order.isDelivered,
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

  deliveredMessageUpdateMessage(element: any) {
    this.dataService
      .notifyUpdateDeliveryDate(
        String(this.customerId),
        new Date().toISOString(),
        element._id
      )
      .subscribe(
        (response) => {
          // this.getOrderDetails();
          // console.log('Delivery date updated successfully:', response);
          // Optionally, you can refresh the orders or show a success message
        },
        (error) => {
          console.error('Error updating delivery date:', error);
        }
      );
  }

  viewOrders(order: any): void {
    this.dialog.open(OrderSummaryComponent, {
      width: '600px',
      height: '600px',
      // disableClose: true,
      data: order,
    });
  }

  notify1(element: any) {
    console.log('element', element);
    this.deliveredMessageUpdateMessage(element);
    this.notifyCustomer(
      element.customerId._id,
      element.items,
      element.customerId.phone
    );
  }

  notifyCustomer(customerId: string, items?: any[], phone?: string): void {
    let phoneNo = phone;
    if (!customerId) {
      alert('Customer ID is missing.');
      return;
    }
    const customer = this.allConsumerList.find(
      (consumer: any) => consumer._id === customerId
    );
    if (customer && customer.phone) {
      phoneNo = customer.phone || phone;
      // console.log('Phone No:', customer.phone);
    } else {
      console.log('Customer not found');
    }
    if (!items || items.length === 0) {
      alert('Item list is empty.');
      return;
    }

    // Build item details message
    let itemDetails = items
      .map((item, index) => {
        return `${index + 1}. ${item.productName} -  ${item.quantity}`;
      })
      .join('\n');

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const message = `Your item has been Placed.

Order Summary:
${itemDetails}
-------------------------
Total Amount = ₹${totalAmount}

Thank you!
Jay Drycleaners
Please visit again.`;

    console.log(message);

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  getAllCustomers() {
    return new Promise<void>((resolve, reject) => {
      // Fetch all customers from the data service
      this.dataService.getAllCustomers().subscribe({
        next: (data: any) => {
          this.allConsumerList = data || [];
          resolve();
        },
        error: (err) => {
          reject(err);
          console.error('Error fetching customers:', err);
        },
      });
    });
  }

  copyOrderMessage(element: any): void {
    const items = element.items || [];

    if (!items.length) {
      alert('Item list is empty.');
      return;
    }

    // const customerName = element.customerId?.fullName || 'Customer';
    // const billNumber = element.billNumber || '';
    // const serviceType = element.serviceType || '';
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    );

    const itemDetails = items
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.productName} - ${item.quantity}`
      )
      .join('\n');

    const message = `Your item has been Placed.

Order Summary:
${itemDetails}
-------------------------
Total Amount = ₹${totalAmount}

Thank you!
Jay Drycleaners
Please visit again.`;

    navigator.clipboard.writeText(message).then(
      () => alert('Order message copied to clipboard!'),
      (err) => alert('Failed to copy message: ' + err)
    );
  }
}
