import { TestBed } from '@angular/core/testing';

import { AppRoutingServiceService } from './app-routing-service.service';

describe('AppRoutingServiceService', () => {
  let service: AppRoutingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppRoutingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
