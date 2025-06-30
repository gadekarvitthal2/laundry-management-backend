import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-roll-press-master',
  standalone: false,
  templateUrl: './roll-press-master.component.html',
  styleUrl: './roll-press-master.component.scss'
})
export class RollPressMasterComponent {
  rollOrPressType = '';
  
  price = 0;

  rollOrPressList: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadRollOrPress();
  }

  loadRollOrPress(): void {
    this.dataService.getRollOrPressType().subscribe({
      next: (data) => this.rollOrPressList = data,
      error: (err) => console.error('Error loading roll or press:', err)
    });
  }

  // loadDresses(): void {
  //   this.dataService.getDresses().subscribe({
  //     next: (data) => this.dressList = data,
  //     error: (err) => console.error('Error loading dresses:', err)
  //   });
  // }

  addRollOrPressType(): void {
    if (this.rollOrPressType && this.price > 0) {
      const newRollOrPress: any = { rollOrPressType: this.rollOrPressType, price: this.price };
      this.dataService.addRollOrPressType(newRollOrPress).subscribe({
        next: () => {
          this.rollOrPressType = '';
          this.price = 0;
          this.loadRollOrPress(); // Refresh list
        },
        error: (err) => alert(err.error.message || 'Error adding roll or press type')
      });
    } else {
      alert('Please enter valid roll or press type and price.');
    }
  }

  deleteRollOrPress(id?: string): void {
    if (!id) return;
    this.dataService.deleteRollOrPress(id).subscribe({
      next: () => this.loadRollOrPress(),
      error: (err) => alert('Error deleting roll or press')
    });
  }
}
