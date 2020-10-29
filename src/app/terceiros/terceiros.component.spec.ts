import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerceirosComponent } from './terceiros.component';

describe('TerceirosComponent', () => {
  let component: TerceirosComponent;
  let fixture: ComponentFixture<TerceirosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerceirosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerceirosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
