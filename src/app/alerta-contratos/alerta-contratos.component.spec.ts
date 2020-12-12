import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaContratosComponent } from './alerta-contratos.component';

describe('AlertaContratosComponent', () => {
  let component: AlertaContratosComponent;
  let fixture: ComponentFixture<AlertaContratosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertaContratosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertaContratosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
