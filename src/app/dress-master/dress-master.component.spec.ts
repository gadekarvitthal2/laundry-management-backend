import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DressMasterComponent } from './dress-master.component';

describe('DressMasterComponent', () => {
  let component: DressMasterComponent;
  let fixture: ComponentFixture<DressMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DressMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DressMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
