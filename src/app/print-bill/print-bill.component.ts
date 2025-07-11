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
billNumber: any;
  customerId: any;
  constructor(
    private dataService: DataService,
    private router: ActivatedRoute
  ) {
    this.router.queryParams.subscribe((params) => {
      if (params['customerId']) {
        this.customerId  = params['customerId'];
        this.incomingCustomerId = params['customerId'];
        this.finalOrder = params['orderData']
          ? JSON.parse(params['orderData'])
          : null;
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
    // console.log(this.billData[0])
    this.deliveredMessageUpdateMessage(this.billData[0]);
  }

  parseApiToBillData(apiResponse: any): any[] {
    const createdAt = new Date(apiResponse.createdAt);
    const deliveryDate = new Date(apiResponse.deliveryDetails.date);
    const items = apiResponse.items;
    this.billNumber = apiResponse.billNumber
    // Map base item info
    const sampleItemData = items.map((item: any, index: number) => ({
      sr_no: index + 1,
      particulars: item.productName,
      qty: item.quantity,
      rollorpressproduct: item.rollorpressproduct,
      unitPrice: item.unitPrice,
      // billNumber: item.billNumber,
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
        .filter((i) => i.particulars?.toLowerCase().includes('roll'))
        .reduce((sum, i) => sum + i.qty, 0);

      const steamCount = batch
        .filter((i) => i.particulars?.toLowerCase().includes('steam'))
        .reduce((sum, i) => sum + i.qty, 0);

      return {
        booking_slip: {
          booking_no: `WC/${apiResponse.billNumber}${
            batchedItems.length > 1 ? '-' + (index + 1) : ''
          }`,
          booking_date: createdAt,
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
        _id:apiResponse._id
      };
    });
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
  let fullName;
  let deliveryDate = this.finalOrder?.deliveryDetails?.date;

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

  phoneNo = customer.phone || phone;
  fullName = customer.fullName || 'Customer';

  if (!items || items.length === 0) {
    alert('Item list is empty.');
    return;
  }

  const itemDetails = items
    .map((item, index) => `${index + 1}. ${item.productName}   ${item.quantity}`)
    .join('\n');

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const message = 
`*Name:* ${fullName.toLocaleUpperCase()}
*Bill.No:* ${this.removeLeadingZeros(this.billNumber)}
*B.D:* ${this.formatDateWithOptionalTime(customer.createdAt)}
*D.D:* ${this.formatDateWithOptionalTime(deliveryDate)}
*Your order has been Placed.*

*Order Summary:*
${itemDetails}
------------------------
*Total Quantity:* ${totalQuantity}
*Total Amount:* ₹${totalAmount}/-

*Thank you!*
Jay Drycleaners
Please visit again.`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/91${phoneNo}?text=${encodedMessage}`;
  window.open(url, '_blank');
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
    formattedDate += ` ${String(displayHours).padStart(2, '0')}:${displayMinutes} ${ampm}`;
  }

  return formattedDate;
}

removeLeadingZeros(value: string): string {
  return String(Number(value));
}

copyOrderMessage(): void {
  const items = this.finalOrder?.items || [];

  if (!items.length) {
    alert('Item list is empty.');
    return;
  }

  const customerId = this.finalOrder?.customerId;
  const customer = this.allConsumerList?.find(
    (consumer: any) => consumer._id === customerId
  );

  const fullName = customer?.fullName
    ? this.dataService.toTitleCase(customer.fullName)
    : 'Customer';

  const billNumber = this.removeLeadingZeros(this.billNumber || '');
  const bookingDate = this.formatDateWithOptionalTime(customer?.createdAt);
  const deliveryDate = this.formatDateWithOptionalTime(this.finalOrder?.deliveryDetails?.date);
  const address = customer?.address || 'No Address';

  const maxNameLength = Math.max(...items.map((item: any) => item.productName.length), 12);

  const itemDetails = items
    .map((item: any, index: number) => {
      const paddedName = item.productName.padEnd(maxNameLength + 2, ' ');
      return `${index + 1}. ${paddedName}${item.quantity}`;
    })
    .join('\n');

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
  const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const message =
`*Name:* ${fullName.toLocaleUpperCase()}
*Bill.No:* ${billNumber}
*B.D:* ${bookingDate}
*D.D:* ${deliveryDate}
*Your order has been Placed.*

*Order Summary:*
${itemDetails}
------------------------
*Total Quantity:* ${totalQuantity}
*Total Amount:* ₹${totalAmount}/-

*Thank you!*
Jay Drycleaners
Please visit again.`;

  navigator.clipboard.writeText(message).then(
    () => alert('Message copied to clipboard!'),
    (err) => alert('Failed to copy message: ' + err)
  );
}

  getAllCustomers() {
    return new Promise<void>((resolve, reject) => {
      // Fetch all customers from the data service
      this.dataService.getAllCustomers().subscribe({
        next: (data: any) => {
          this.allConsumerList = data || [];
          console.log('this.allConsumerList',this.allConsumerList)
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
          console.log('response[0]',response[0])
          this.billData = this.parseApiToBillData(customerdata);

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
    return result;
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
}
