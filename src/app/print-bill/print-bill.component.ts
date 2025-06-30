import {
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataService } from '../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-print-bill',
  standalone: false,
  templateUrl: './print-bill.component.html',
  styleUrl: './print-bill.component.scss',
})
export class PrintBillComponent {
  billData: any;
  @ViewChildren('billContent') billContentRefs!: QueryList<ElementRef>;
  incomingCustomerId = '';
  finalOrder: any;
  latestOrder: any = null;
  allConsumerList: any[] = [];
  isOrderPlaced = false; // Flag to track if the order has been placed
  splitItems: any[] = [
    {
      sr_no: 0,
      particulars: '',
      qty: 0,
      rollorpressproduct: '',
    },
  ];
  items: any[][] = [];

  constructor(
    private dataService: DataService,
    private router: ActivatedRoute
  ) {
    this.router.queryParams.subscribe((params) => {
      if (params['customerId']) {
        this.incomingCustomerId = params['customerId'];
        this.finalOrder = params['orderData']
          ? JSON.parse(params['orderData'])
          : null;
        console.log('Final Order:', this.finalOrder);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getBillDataFromApi();
    // await this.getLatestOrderFromApi();
    await this.getAllCustomers();
    await this.getCustomerById();
    // this.splitItems = this.getBatches(this.items, 10);

    // this.billData = {
    //   booking_slip: {
    //     booking_no: 'WC/01094',
    //     booking_date: '09/06/2025',
    //     delivery_date: '16/06/2025',
    //   },
    //   customer_info: {
    //     name: 'SONI TEJAL MUKUND',
    //     address: 'MAHESH NAGAR, Chh. Sambhajinagar',
    //     mobile: '7219039013',
    //   },
    //   items: [
    //     { sr_no: 1, particulars: 'JEANS', qty: 2, rollOrPressType: 'roll' },
    //     { sr_no: 2, particulars: 'T-SHIRT', qty: 3, rollOrPressType: 'normal' },
    //     { sr_no: 3, particulars: 'SAREE', qty: 1, rollOrPressType: 'steam' },
    //     { sr_no: 4, particulars: 'JACKET', qty: 2, rollOrPressType: 'roll' },
    //     {
    //       sr_no: 5,
    //       particulars: 'LEGGINGS',
    //       qty: 4,
    //       rollOrPressType: 'normal',
    //     },
    //     { sr_no: 6, particulars: 'DUPATTA', qty: 2, rollOrPressType: 'steam' },
    //     { sr_no: 7, particulars: 'TROUSER', qty: 1, rollOrPressType: 'roll' },
    //     { sr_no: 8, particulars: 'TOP', qty: 2, rollOrPressType: 'normal' },
    //     { sr_no: 9, particulars: 'KURTA', qty: 3, rollOrPressType: 'roll' },
    //     { sr_no: 10, particulars: 'SWEATER', qty: 1, rollOrPressType: 'steam' },
    //     { sr_no: 11, particulars: 'SKIRT', qty: 2, rollOrPressType: 'normal' },
    //     { sr_no: 12, particulars: 'SCARF', qty: 1, rollOrPressType: 'roll' },
    //   ],
    //   summary: {
    //     total_qty: 12,
    //     amount: 900.0,
    //     old_balance: 900.0,
    //     // net_amount: this.billData.summary?.amount  + this.billData.summary?.old_balance,
    //   },
    //   remark: 'No Guarantee For Colour, Shrink Etc. of Cloths',
    //   footer: {
    //     sunday_closed_time: '9.30 a.m. to 1.00 p.m. & 4.00 p.m. to 9.00 p.m.',
    //   },
    //   footer_extra_info: {
    //     // Added this new section
    //     mobile: 9823112345,
    //     address: 'MAHESH NAGAR,',
    //     customer_name: 'SONI TEJAL MUKUND',
    //     booking_no: 'WC/01094',
    //     time: '12:56:16',
    //     date: '16/06/25',
    //     total_qty: 12,
    //     roll_press: 'O',
    //     steam_press: 'O',
    //   },
    // };

    // this.billData = this.parseApiToBillData(this.latestOrder);
    // this.billData.summary.net_amount =
    //   this.billData.summary.amount + this.billData.summary.old_balance;
  }

  // printBill(): void {
  //   const printContents = this.billContentRefs.map(
  //     (ref) => ref.nativeElement.innerHTML
  //   );
  //   const originalContents = document.body.innerHTML;

  //   document.body.innerHTML = printContents.join('');
  //   document.body.style.margin = '0';
  //   window.print();
  //   document.body.innerHTML = originalContents;
  // }
  printBill(): void {
    const printContents = this.billContentRefs
      .map((ref, index, arr) => {
        const html = ref.nativeElement.outerHTML; // Use outerHTML to preserve full DOM
        const pageBreak =
          index < arr.length - 1
            ? '<div style="page-break-after: always;"></div>'
            : '';
        return html + pageBreak;
      })
      .join('');

    const originalContents = document.body.innerHTML;
    const originalStyles = document.head.innerHTML;

    document.body.innerHTML = printContents;
    document.head.innerHTML = originalStyles; // Retain styles

    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload(); // Reset app state if needed
  }

  async downloadPdf(): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const elements = this.billContentRefs.toArray();

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i].nativeElement;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    const bookingNo =
      this.billData[0]?.booking_slip?.booking_no || 'multi_bill';
    pdf.save(`drycleaner_bill_${bookingNo}.pdf`);
  }

  sendWhatsAppMessage(): void {
    this.notifyCustomer(
      this.incomingCustomerId,
      this.finalOrder.items,
      String(this.finalOrder.phoneNo)
    );
  }

  parseApiToBillData(apiResponse: any): any[] {
    const createdAt = new Date(apiResponse.createdAt);
    const deliveryDate = new Date(apiResponse.deliveryDetails.date);
    const items = apiResponse.items;

    // Map base item info
    const sampleItemData = items.map((item: any, index: number) => ({
      sr_no: index + 1,
      particulars: item.productName,
      qty: item.quantity,
      rollorpressproduct: item.rollorpressproduct,
      unitPrice: item.unitPrice,
    }));

    // Split into batches of 10
    const batchedItems = this.getBatches(sampleItemData, 10);

    // Create bill per batch
    const bills = batchedItems.map((batch, index) => {
      // Summary for current batch
      const batchTotalQty = batch.reduce((sum, item) => sum + item.qty, 0);
      const batchAmount = batch.reduce(
        (sum, item) => sum + item.unitPrice * item.qty,
        0
      );
      const rollCount = batch
        .filter((i) => i.rollorpressproduct?.toLowerCase() === 'roll_press')
        .reduce((sum, i) => sum + i.qty, 0);
      const steamCount = batch
        .filter((i) => i.rollorpressproduct?.toLowerCase() === 'steem_press')
        .reduce((sum, i) => sum + i.qty, 0);
      const normalCount = batch
        .filter((i) => i.rollorpressproduct?.toLowerCase() === 'normal')
        .reduce((sum, i) => sum + i.qty, 0);

      return {
        booking_slip: {
          booking_no: `WC/${apiResponse.billNumber}${
            batchedItems.length > 1 ? '-' + (index + 1) : ''
          }`,
          booking_date: createdAt.toLocaleDateString('en-GB'),
          delivery_date: deliveryDate.toLocaleDateString('en-GB'),
        },
        customer_info: {
          name: apiResponse.customerId.fullName,
          address: apiResponse.customerId.address,
          mobile: apiResponse.customerId.phone,
        },
        items: batch, // only 10 or fewer
        summary: {
          total_qty: batchTotalQty,
          amount: batchAmount,
          old_balance: apiResponse.charges.taxAmount || 0,
          net_amount: batchAmount + (apiResponse.charges.taxAmount || 0),
        },
        remark: 'No Guarantee For Colour, Shrink Etc. of Cloths',
        footer: {
          sunday_closed_time: '9.30 a.m. to 1.00 p.m. & 4.00 p.m. to 9.00 p.m.',
        },
        footer_extra_info: {
          mobile: apiResponse.customerId.phone,
          address: apiResponse.customerId.address,
          customer_name: apiResponse.customerId.fullName,
          booking_no: `WC/${apiResponse.billNumber}`,
          time: createdAt.toTimeString().split(' ')[0],
          date: createdAt.toLocaleDateString('en-GB'),
          total_qty: batchTotalQty,
          roll_press: rollCount > 0 ? rollCount : '0',
          steam_press: steamCount > 0 ? steamCount : '0',
        },
      };
    });
    console.log('Parsed Bills:', bills);
    return bills;
  }

  async getBillDataFromApi(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.dataService
        .getAllOrdersWithCustomerInfo(this.incomingCustomerId)
        .subscribe({
          next: async (response) => {
            resolve();
            this.latestOrder = response.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0];
            console.log('Latest order:', this.latestOrder);
            // this.billData = await this.parseApiToBillData(this.latestOrder);
            console.log('Parsed Bill Data:', this.billData);
          },
          error: (error) => {
            console.error('Error fetching bill data:', error);
          },
        });
    });
  }

  // get latest order from api
  getLatestOrderFromApi(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.dataService
        .getAllOrdersWithCustomerInfo(this.incomingCustomerId)
        .subscribe({
          next: (response) => {
            this.latestOrder = response.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0];
            console.log('Latest order:', this.latestOrder);
            // this.parseApiToBillData(this.latestOrder);
            resolve();
          },
          error: (error) => {
            console.error('Error fetching latest order:', error);
          },
        });
    });
  }

  placeOrder(): void {
    this.dataService.createOrder(this.finalOrder).subscribe({
      next: (response) => {
        console.log('Order created successfully:', response);
        alert('Order placed successfully!');
        this.isOrderPlaced = true; // Set the flag to true after successful order placement
        // this.notifyCustomer(this.incomingCustomerId, this.finalOrder.items);
      },
      error: (error) => {
        console.error('Error creating order:', error);
      },
    });
  }

  notifyCustomer(customerId: string, items: any[], phone: string): void {
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
      console.log('Phone No:', customer.phone);
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
        return `${index + 1}. ${item.productName} - Qty: ${item.quantity}, ₹${
          item.unitPrice
        } x ${item.quantity} = ₹${item.amount}`;
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

  copyOrderMessage(): void {
    // this.notifyCustomer(
    //   this.incomingCustomerId,
    //   this.finalOrder.items,
    //   String(this.finalOrder.phoneNo)
    // );
    const items = this.finalOrder?.items || [];
    const phoneNo = this.finalOrder?.phoneNo || '';

    if (!items || items.length === 0) {
      alert('Item list is empty.');
      return;
    }

    // Build item details message
    const itemDetails = items
      .map((item: any, index: number) => {
        return `${index + 1}. ${item.productName} - Qty: ${item.quantity}, ₹${
          item.unitPrice
        } x ${item.quantity} = ₹${item.amount}`;
      })
      .join('\n');

    // Calculate total amount
    const totalAmount = items.reduce((sum: any, item: any) => sum + item.amount, 0);

    // Final message
    const message = `Your item has been Placed.\n\nOrder Summary:\n${itemDetails}\n\nTotal Amount: ₹${totalAmount}\n\nThank you!\nJay Drycleaners\nPlease visit again.`;

    navigator.clipboard.writeText(message).then(
      () => alert('Order message copied to clipboard!'),
      (err) => alert('Failed to copy message: ' + err)
    );
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

  getCustomerById() {
    return new Promise<void>((resolve, reject) => {
      this.dataService.getOrdersByCustomer(this.incomingCustomerId).subscribe({
        next: (response) => {
          const customerdata = response[0];
          console.log('Customer data:', customerdata);
          this.billData = this.parseApiToBillData(customerdata);
          console.log('Parsed Bill Data:', this.billData);

          resolve();
          if (customerdata) {
          } else {
            reject('Customer not found');
            console.error(
              'Customer not found for ID:',
              this.incomingCustomerId
            );
          }
        },
      });
    });
  }

  getBatches(array: any[], batchSize: number): any[][] {
    const result: any[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      result.push(array.slice(i, i + batchSize));
    }
    console.log('Batches:', result);
    return result;
  }
}
