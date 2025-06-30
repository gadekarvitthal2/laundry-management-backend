import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollPressMasterComponent } from './roll-press-master.component';

describe('RollPressMasterComponent', () => {
  let component: RollPressMasterComponent;
  let fixture: ComponentFixture<RollPressMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RollPressMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RollPressMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
