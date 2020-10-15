import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovaPessoaComponent } from './nova-pessoa.component';

describe('NovaPessoaComponent', () => {
  let component: NovaPessoaComponent;
  let fixture: ComponentFixture<NovaPessoaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovaPessoaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovaPessoaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
