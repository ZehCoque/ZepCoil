import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcluirDialogComponent } from './concluir-dialog.component';

describe('ConcluirDialogComponent', () => {
  let component: ConcluirDialogComponent;
  let fixture: ComponentFixture<ConcluirDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConcluirDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcluirDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
