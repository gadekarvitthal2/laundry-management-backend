import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-summary',
  standalone: false,
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent implements OnInit {
  // @Input() order: any;
  itemList: any[] = [];
  displayedColumns: string[] = [
    'productName',
    'quantity',
    'unitPrice',
    'totalPrice',
  ];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    if (this.data && this.data.items) {
      this.itemList = this.data.items.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }));
    }
  }

  getTotalAmount(): number {
    return this.itemList.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  // Additional methods and properties for the order summary can be added here
}
