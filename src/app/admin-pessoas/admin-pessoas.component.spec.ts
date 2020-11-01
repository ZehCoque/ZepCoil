import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPessoasComponent } from './admin-pessoas.component';

describe('AdminPessoasComponent', () => {
  let component: AdminPessoasComponent;
  let fixture: ComponentFixture<AdminPessoasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPessoasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPessoasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
