import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import { AuthenticationService } from './services/authentication.service';
import { User } from './classes/user';
import { newDataTrackerService } from './services/new-data-tracker.service';
import { AdminCcComponent } from './admin-cc/admin-cc.component';
import { AdminPessoasComponent } from './admin-pessoas/admin-pessoas.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: User;
  current_url: string;

  constructor(private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private newDataEmitter: newDataTrackerService,
    private router: Router) {

  }

  ngOnInit(){
    this.authenticationService.user.subscribe(x => this.user = x);
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      if (event.url = "/") {
        this.current_url = event.urlAfterRedirects;
      } else {
        this.current_url = event.url;
      }

    });
  }

  logout() {
      this.authenticationService.logout();
  }

  refresh(): void {
    this.newDataEmitter.newDataEmit('refresh');
  }

  openCCDialog(): void {
    const dialogRef = this.dialog.open(AdminCcComponent, {
      width: '500px',
      data: {}
    });

    let sub = dialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
      sub.unsubscribe();
    });
  }

  openPessoaDialog(): void {
    const dialogRef = this.dialog.open(AdminPessoasComponent, {
      width: '500px',
      data: {}
    });

    let sub = dialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
      sub.unsubscribe();
    });
  }
}
