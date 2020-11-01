import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class newDataTrackerService {

  private newDataSource = new BehaviorSubject('default');
  currentData = this.newDataSource.asObservable();

  constructor() { }

  newDataEmit(data?) {
    if (!data) return;
    this.newDataSource.next(data)
  }

}
