import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmtContratosModalComponent } from './pgmt-contratos-modal.component';

describe('PgmtContratosModalComponent', () => {
  let component: PgmtContratosModalComponent;
  let fixture: ComponentFixture<PgmtContratosModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgmtContratosModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgmtContratosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
