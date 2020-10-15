import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoCCComponent } from './novo.cc.component';

describe('Novo.CcComponent', () => {
  let component: NovoCCComponent;
  let fixture: ComponentFixture<NovoCCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovoCCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoCCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
