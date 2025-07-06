import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { Router } from '@angular/router';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';

@Component({
  selector: 'app-customer-registration',
  standalone: false,
  templateUrl: './customer-registration.component.html',
  styleUrl: './customer-registration.component.scss',
})
export class CustomerRegistrationComponent implements OnInit {
  customer = {
    fullName: '',
    // email: '',
    phone: '',
    address: '',
    pickupPreference: 'Shop',
  };

  successMessage: string = '';
  errorMessage: string = '';

  customerId: string = ''; // Example value
  serviceType: string = 'Wet_Cleaning'; // Example value

  orderItems: any[] = [];
  bookingDate: string = new Date().toISOString().split('T')[0];
  deliveryDate: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  pickupCharge: number = 0; // Example value
  deliveryCharge: number = 0; // Example value
  customerCtrl = new FormControl('');
  filteredCustomers!: Observable<any[]>;

  // Calculated values
  subtotal: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  allConsumerList: any[] = [];
  customerSearch = '';
  showDropdown = false;
  incomingCustomerIdFromReports: string = '';
  billNumber: string = '';

  TAX_RATE = 0; // 7.25%

  // List of available cloths (as in your original Angular snippet)
  clothList: any[] = [
    { _id: '1', type: 'Top/Shirt-Silk', defaultPrice: 6.5, position: 1 },
    { _id: '2', type: 'Pants-Cotton', defaultPrice: 5.0, position: 2 },
    { _id: '3', type: 'Dress-Delicate', defaultPrice: 8.0, position: 3 },
    { _id: '4', type: 'Cardigan', defaultPrice: 5.8, position: 4 },
    { _id: '5', type: 'Other', defaultPrice: 4.0, position: 5 },
  ];

  // clothList: any[] = []; // This will be populated from the service

  // Pickup and delivery types for dropdowns
  pickupTypes: string[] = ['Door Pickup', 'Self Drop-off'];
  deliveryTypes: string[] = ['Door Delivery', 'Self Pickup'];
  selectedPickupType: string = this.pickupTypes[1];
  selectedDeliveryType: string = this.deliveryTypes[1];

  constructor(private dataService: DataService, private router: Router) {
    this.router.events.subscribe((data: any) => {
      if (data?.snapshot?.queryParams?.customerId) {
        this.incomingCustomerIdFromReports =
          data.snapshot.queryParams.customerId;
        if (this.incomingCustomerIdFromReports) {
          this.customerId = this.incomingCustomerIdFromReports;
        }
      }
    });
  }
  async ngOnInit(): Promise<void> {
    await this.loadDresses();
    this.addInitialItems();
    this.calculateAllTotals();
    await this.getAllCustomers();
    await this.nextBillNumber();

    // Initialize filtered list with all customers first
    this.filteredCustomers = this.customerCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCustomers(value || ''))
    );
  }

  private _filterCustomers(value: string): any[] {
    const filterValue = value.toLowerCase();
    let filteredList = this.allConsumerList.filter((customer: any) =>
      customer.fullName.toLowerCase().includes(filterValue)
    );

    return filteredList;
  }

  register() {
    this.dataService.registerCustomer(this.customer).subscribe({
      next: (res: any) => {
        this.getAllCustomers(); // Refresh the customer list
        this.customerId = res.customer._id; // Assuming the response contains the customer ID
        this.successMessage = 'Customer registered successfully!';
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = 'Customer with this phone already exists.';
          this.customerId = ''; // Reset customerId on error
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }

  printAndPlaceOrder() {
    if (
      this.orderItems.some(
        (item) => !item.productId || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      // More complex validation or user notification could be added
      console.error('Form is invalid. Please check order items.');
      alert(
        'Please ensure all order items have a product, valid quantity, and unit price.'
      );
      return;
    }

    const finalOrder = {
      customerId: this.customerId,
      serviceType: this.serviceType,
      items: this.orderItems.map((item) => ({
        ...item,
        productName: this.clothList.find((c) => c._id === item.productId)?.type, // Add product name for convenience
      })),
      pickupDetails: {
        type: this.selectedPickupType,
        date: this.bookingDate,
        charge: this.pickupCharge,
      },
      deliveryDetails: {
        type: this.selectedDeliveryType,
        date: this.deliveryDate,
        charge: this.deliveryCharge,
      },
      charges: {
        subtotal: this.subtotal,
        taxAmount: this.taxAmount,
        totalAmount: this.totalAmount,
      }
    };

    this.dataService.createOrder(finalOrder).subscribe({
      next: (response) => {
        this.successMessage = 'Order placed successfully!';
        alert('Order placed successfully!');

        if (!this.customerId) {
          alert('Please register a customer first.');
          return;
        }
        // this.onSubmit(); // Call the form submission handler
        this.router.navigate(['/print-bill'], {
          queryParams: {
            customerId: this.customerId,
            orderData: JSON.stringify(finalOrder),
          },
        });

        // this.notifyCustomer(this.customerId, finalOrder.items);
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.successMessage = '';
        this.errorMessage = 'Failed to place order.';
      },
    });
  }

  loadDresses(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.dataService.getDresses().subscribe({
        next: (data: any) => {
          this.clothList = data.sort(
            (a: any, b: any) => a.position - b.position
          );
          resolve(data);
        },
        error: (err) => {
          console.error('Error loading dresses:', err);
          reject(err);
        },
      });
    });
  }

  addInitialItems(): void {
    this.orderItems.push({
      productId: 0,
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      rollorpressproduct: 'Normal',
    });
  }

  addNewItem(): void {
    this.orderItems.push({
      productId: null,
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      rollorpressproduct: 'Normal', // Default value for new items
    });
    this.calculateAllTotals(); // Recalculate if adding an empty item affects totals (e.g., if there's default logic)
  }

  removeItem(index: number): void {
    if (index > -1 && index < this.orderItems.length) {
      this.orderItems.splice(index, 1);
      this.calculateAllTotals();
    }
  }

  // Called when the product changes in an order item row
  onProductChange(item: any): void {
    const selectedCloth = this.clothList.find(
      (cloth) => cloth._id === item.productId
    );
    if (selectedCloth) {
      item.unitPrice = selectedCloth.price || 0; // Set default price if available
    } else {
      item.unitPrice = 0;
    }
    this.calculateItemAmount(item); // Then update the total amounts
  }

  // Called when quantity or unit price changes
  calculateItemAmount(item: any): void {
    item.amount = (item.quantity || 0) * (item.unitPrice || 0);
    this.calculateAllTotals();
  }

  calculateAllTotals(): void {
    // Calculate subtotal
    this.subtotal = this.orderItems.reduce((sum, item) => sum + item.amount, 0);

    // Calculate tax
    // this.taxAmount = this.subtotal * this.TAX_RATE;
    // this.taxAmount = this.TAX_RATE;

    // Calculate total amount
    this.totalAmount =
      this.subtotal +
      Number(this.taxAmount) +
      (this.pickupCharge || 0) +
      (this.deliveryCharge || 0);
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

  // Form submission handler (equivalent to addDress())
  onSubmit(): void {
    if (
      this.orderItems.some(
        (item) => !item.productId || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      // More complex validation or user notification could be added
      console.error('Form is invalid. Please check order items.');
      alert(
        'Please ensure all order items have a product, valid quantity, and unit price.'
      );
      return;
    }

    const finalOrder = {
      customerId: this.customerId,
      serviceType: this.serviceType,
      items: this.orderItems.map((item) => ({
        ...item,
        productName: this.clothList.find((c) => c._id === item.productId)?.type, // Add product name for convenience
      })),
      pickupDetails: {
        type: this.selectedPickupType,
        date: this.bookingDate,
        charge: this.pickupCharge,
      },
      deliveryDetails: {
        type: this.selectedDeliveryType,
        date: this.deliveryDate,
        charge: this.deliveryCharge,
      },
      charges: {
        subtotal: this.subtotal,
        taxAmount: this.taxAmount,
        totalAmount: this.totalAmount,
      },
    };

    if (!this.customerId) {
      alert('Please register a customer first.');
      return;
    }
    // this.onSubmit(); // Call the form submission handler
    this.dataService.createOrder(finalOrder).subscribe({
      next: (response) => {
        alert('Order placed successfully!');
        // this.isOrderPlaced = true; // Set the flag to true after successful order placement
        // this.notifyCustomer(this.incomingCustomerId, this.finalOrder.items);
        this.router.navigate(['/print-bill'], {
          queryParams: {
            customerId: this.customerId,
            orderData: JSON.stringify(finalOrder),
          },
        });
      },
      error: (error) => {
        console.error('Error creating order:', error);
      },
    });
  }

  async onCustomerSelected(customer: any): Promise<void> {
    this.customerId = customer.value._id;
    await this.getAllCustomers();
  }

  notifyCustomer(customerId: string, items: any[]): void {
    let phoneNo = '';
    if (!customerId) {
      alert('Customer ID is missing.');
      return;
    }
    const customer = this.allConsumerList.find(
      (consumer: any) => consumer._id === customerId
    );
    if (customer && customer.phone) {
      phoneNo = customer.phone || '';
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
        return `${index + 1}. ${item.productName}  ${item.quantity}, 
          ${item.quantity}`;
      })
      .join('\n');

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Final message
    const message = `Your item has been Placed.\n\nOrder Summary:\n${itemDetails}\n\nTotal Amount: ₹${totalAmount}\n\nThank you!\nJay Drycleaners\nPlease visit again.`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  nextBillNumber() {
    return new Promise<string>((resolve, reject) => {
      this.dataService.getNextBillNo().subscribe({
        next: (res: any) => {
          this.billNumber = res.billNumber;
          resolve(res.billNumber);
        },
        error: (err) => {
          console.error('Error fetching bill number', err);
          reject(err);
        },
      });
    });
  }
}
