import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratosPagamentosComponent } from './contratos-pagamentos.component';

describe('ContratosPagamentosComponent', () => {
  let component: ContratosPagamentosComponent;
  let fixture: ComponentFixture<ContratosPagamentosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContratosPagamentosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratosPagamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
