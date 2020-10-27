import { Component } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { AuthenticationService } from './services/authentication.service';
import { User } from './classes/user';
import { newDataTrackerService } from './services/new-data-tracker.service';
import { AdminCcComponent } from './admin-cc/admin-cc.component';
import { NovaPessoaComponent } from './nova-pessoa/nova-pessoa.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: User;

  constructor(private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private newDataEmitter: newDataTrackerService) {

  }

  ngOnInit(){
    this.authenticationService.user.subscribe(x => this.user = x);
  }

  logout() {
      this.authenticationService.logout();
  }

  openCCDialog(): void {
    const dialogRef = this.dialog.open(AdminCcComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(() => {
      this.newDataEmitter.newDataEmit('novoCC');
    });
  }

  openPessoaDialog(): void {
    const dialogRef = this.dialog.open(NovaPessoaComponent, {
      width: '1000px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(() => {
      this.newDataEmitter.newDataEmit('novaPessoa');
    });
  }
}
