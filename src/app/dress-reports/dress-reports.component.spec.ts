import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DressReportsComponent } from './dress-reports.component';

describe('DressReportsComponent', () => {
  let component: DressReportsComponent;
  let fixture: ComponentFixture<DressReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DressReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DressReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
