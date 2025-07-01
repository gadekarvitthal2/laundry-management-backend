import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dress-master',
  standalone: false,
  templateUrl: './dress-master.component.html',
  styleUrl: './dress-master.component.scss'
})
export class DressMasterComponent {
  dressType = '';
  price = 0;
  // items: any[] = []; // fetched from API
  dressList: any[] = [];
displayedColumns: string[] = ['type'];
displayedColumns1: string[] = ['position', 'type', 'price', 'action'];
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadDresses();
  }

  loadDresses(): void {
    this.dataService.getDresses().subscribe({
      next: (data) => {this.dressList = data.sort((a, b) => a.position - b.position);
        // add changing data to the dressList
  
      },

      error: (err) => console.error('Error loading dresses:', err)
    });
  }

  addDressType(): void {
    if (this.dressType && this.price > 0) {
      const newDress: any = { type: this.dressType, price: this.price };
      this.dataService.addDressType(newDress).subscribe({
        next: () => {
          this.dressType = '';
          this.price = 0;
          this.loadDresses(); // Refresh list
        },
        error: (err) => alert(err.error.message || 'Error adding dress type')
      });
    } else {
      alert('Please enter valid dress type and price.');
    }
  }

  deleteDress(id?: string): void {
    if (!id) return;
    this.dataService.deleteDress(id).subscribe({
      next: () => this.loadDresses(),
      error: (err) => alert('Error deleting dress')
    });
  }

drop(event: CdkDragDrop<string[]>) {
  moveItemInArray(this.dressList, event.previousIndex, event.currentIndex);

  // Update position field
  const updatedItems = this.dressList.map((item, index) => ({
    ...item,
    position: index + 1,
  }));

   this.dressList = [...updatedItems];

  // Save new positions to backend
  this.dataService.updateDressPositions(updatedItems).subscribe({
    next: () => console.log('Positions updated successfully'),
    error: (err) => console.error('Error updating positions:', err)
  });
}
}
