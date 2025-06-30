import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBillComponent } from './print-bill.component';

describe('PrintBillComponent', () => {
  let component: PrintBillComponent;
  let fixture: ComponentFixture<PrintBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
