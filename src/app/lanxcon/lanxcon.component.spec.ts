import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanxconComponent } from './lanxcon.component';

describe('LanxconComponent', () => {
  let component: LanxconComponent;
  let fixture: ComponentFixture<LanxconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanxconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanxconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
