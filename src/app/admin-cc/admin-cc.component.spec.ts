import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCcComponent } from './admin-cc.component';

describe('AdminCcComponent', () => {
  let component: AdminCcComponent;
  let fixture: ComponentFixture<AdminCcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
