import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class newDataTrackerService {

  private newDataSource = new BehaviorSubject({});
  currentData = this.newDataSource.asObservable();

  constructor() { }

  newDataEmit(data) {
    this.newDataSource.next(data)
  }

}
