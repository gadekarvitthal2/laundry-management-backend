import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-update-customer',
  standalone: false,
  templateUrl: './update-customer.component.html',
  styleUrl: './update-customer.component.scss'
})
export class UpdateCustomerComponent {
customer: any = {};
  errorMessage = '';
  successMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UpdateCustomerComponent>,
    private http: HttpClient,
    private dataService: DataService
  ) {
    this.customer = { ...data };
  }

  updateCustomer(): void {
    this.dataService.updateCustomer(this.customer._id, this.customer).subscribe({
      next: () => {
        this.successMessage = 'Updated successfully!';
        console.log('Customer updated successfully');
        setTimeout(() => this.dialogRef.close(true), 1000);
      },
      error: (err) => {
        this.errorMessage = 'Error updating customer!';
        console.error('Error updating customer:', err);
      }
    });
  }
}
