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
    'placeOrderNotify',
    'whatspp_delivery_notify',
    'action',
  ];
  isDeliveryMessageSent = '';
  constructor(
    private router: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private routerNew:Router
  ) {
    this.router.queryParams.subscribe((params: any) => {
      this.customerId = params['customerId'];
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
        });
    });
  }

  getAllOrdersWithCustomers(customerId: string) {
    return new Promise((resolve, reject) => {
      this.dataService
        .getAllOrdersWithCustomerInfo(String(customerId))
        .subscribe(
          (data: any[]) => {
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
        (response) => {},
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
      element,
      element.customerId.phone
    );
  }
notifyCustomer(customerId: string, element?: any, phone?: string): void {
  const items: any[] = Array.isArray(element?.items) ? element.items : [];

  if (!customerId) {
    alert('Customer ID is missing.');
    return;
  }

  const customer = this.allConsumerList.find(
    (consumer: any) => consumer._id === customerId
  );

  if (!customer) {
    alert('Customer not found.');
    return;
  }

  const phoneNo = customer.phone || phone || '';
  const address = customer.address || 'No Address';
  const fullName = this.dataService?.toTitleCase(customer.fullName || 'Customer');
  const billNumber = this.removeLeadingZeros(element?.billNumber || '');
  const bookingDate = this.formatDateWithOptionalTime(customer?.createdAt);
  const deliveryDate = this.formatDateWithRemoveTime(element?.deliveryDetails?.date);

  if (!items.length) {
    alert('Item list is empty.');
    return;
  }

  const maxNameLength = Math.max(
    ...items.map((item) => item.productName.length),
    12
  );

  const itemDetails = items
    .map((item, index) => {
      const paddedName = item.productName.padEnd(maxNameLength + 2, ' ');
      return `${index + 1}. ${paddedName}${item.quantity}`;
    })
    .join('\n');

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const message = `*Name:* ${fullName.toLocaleUpperCase()}
*Bill.No:* ${billNumber}
*B.D:* ${bookingDate}
*D.D:* ${deliveryDate}
*Your order has been Placed.*

*Order Summary:*
${itemDetails}
------------------------
*Total Quantity:* ${totalQuantity}
*Total Amount:* ₹${totalAmount}

*Thank you!*
Jay Drycleaners
Please visit again.`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`;
  window.open(url, '_blank');
}


  removeLeadingZeros(value: string): string {
    return String(Number(value));
  }

  formatDateWithOptionalTime(input: string): string {
    if (!input) return '';

    let date: Date;

    // Check if the string includes time (T or space with colon)
    const hasTime = /[T\s]\d{2}:\d{2}/.test(input);

    if (hasTime) {
      // If time is present, parse normally
      date = new Date(input);
    } else {
      // If only date is present, parse as local date (not UTC)
      const [year, month, day] = input.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-based
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    let formattedDate = `${day}/${month}/${year}`;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hasTime && (hours !== 0 || minutes !== 0)) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = String(minutes).padStart(2, '0');
      formattedDate += ` ${String(displayHours).padStart(
        2,
        '0'
      )}:${displayMinutes} ${ampm}`;
    }

    return formattedDate;
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
    const items: any[] = Array.isArray(element?.items) ? element.items : [];

    if (!items.length) {
      alert('Item list is empty.');
      return;
    }

    const customer = element?.customerId;
    const address = this.dataService?.toTitleCase(
      customer?.address || 'No Address'
    );
    const fullName = this.dataService?.toTitleCase(
      customer?.fullName || 'Customer'
    );
    const billNumber = this.removeLeadingZeros(element?.billNumber || '');
    const bookingDate = this.formatDateWithOptionalTime(customer?.createdAt);
    const deliveryDate = this.formatDateWithRemoveTime(
      element?.deliveryDetails?.date
    );

    const message = this.buildWhatsAppOrderMessage({
      fullName,
      billNumber,
      bookingDate,
      deliveryDate,
      items,
      address,
    });

    navigator.clipboard.writeText(message).then(
      () => alert('Order message copied to clipboard!'),
      (err) => alert('Failed to copy message: ' + err)
    );
  }

  buildWhatsAppOrderMessage(params: {
    fullName: string;
    billNumber: string;
    bookingDate: string;
    deliveryDate: string;
    items: any[];
    address: string;
  }): string {
    const { fullName, billNumber, bookingDate, deliveryDate, items, address } =
      params;

    const maxNameLength = Math.max(
      ...items.map((item) => item.productName.length),
      12
    );

    const itemDetails = items
      .map((item, index) => {
        const paddedName = item.productName.padEnd(maxNameLength + 2, ' ');
        return `${index + 1}. ${paddedName}${item.quantity}`;
      })
      .join('\n');

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    return `*Name:* ${fullName.toLocaleUpperCase()}
*Bill.No:* ${billNumber}
*B.D:* ${bookingDate}
*D.D:* ${deliveryDate}
*Your order has been Placed.*

*Order Summary:*
${itemDetails}
------------------------
*Total Quantity:* ${totalQuantity}
*Total Amount:* ₹${totalAmount}

*Thank you!*
Jay Drycleaners
Please visit again.`;
  }

  formatDateWithRemoveTime(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);

    return `${dd}/${mm}/${yy}`;
  }

  DeliveryMessageSent(order: any): void {

     this.dataService
      .notifyUpdateDeliveryDateIfOrderComplete(
        String(this.customerId),
        new Date().toISOString(),
        order._id
      )
      .subscribe(
        (response) => {},
        (error) => {
          console.error('Error updating delivery date:', error);
        }
      );

    const phoneNo = order.customerId.phone;
    if (!phoneNo) {
      alert('Phone number is missing.');
      return;
    }
    const message = `*Your order has been delivered.*\n\nThank you!\nJay Drycleaners\nPlease visit again.`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`; // Add country code explicitly
    window.open(url, '_blank');
  }

  editOrder(data: any) {
    console.log('data',data._id);
     this.routerNew.navigate(['/customer-registration'], {
      queryParams: { orderId: data._id },
    });
  }

  deleteOrder(data: any) {

  }
}
