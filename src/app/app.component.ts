import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AuthenticationService } from './services/authentication.service';
import { User } from './classes/user';
import { newDataTrackerService } from './services/new-data-tracker.service';
import { AdminCcComponent } from './admin-cc/admin-cc.component';
import { AdminPessoasComponent } from './admin-pessoas/admin-pessoas.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ServerService } from './services/server.service';
import { AlertaContratosComponent } from './alerta-contratos/alerta-contratos.component';
import { PgmtContratosModalComponent } from './pgmt-contratos-modal/pgmt-contratos-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: User;
  current_url: string;
  contagem: number = 0; //Contagem de término de contrato
  contagem6Meses: number = 0; //Contagem de aviso de 6 meses

  constructor(private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private newDataEmitter: newDataTrackerService,
    private router: Router,
    private server: ServerService) {

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


    if (this.user) {
      this.server.get_List('contagem_contratos_alerta').then((response) => {
        this.contagem = response[0].Contagem;

      })
      this.server.get_List('contagem_contratos_alerta_6_meses').then((response) => {
        this.contagem6Meses = response[0].Contagem;
      })
    }


    this.newDataEmitter.currentData.subscribe(() => {
      if (this.user) {
        this.server.get_List('contagem_contratos_alerta').then((response) => {
          this.contagem = response[0].Contagem;
        });
        this.server.get_List('contagem_contratos_alerta_6_meses').then((response) => {
          this.contagem6Meses = response[0].Contagem;
        })
      }
    })

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

  openAlertsDialog(): void {
    const dialogRef = this.dialog.open(AlertaContratosComponent, {
      width: '500px',
      data: {}
    });
  }

  openLanXConDialog(): void {
    const dialogRef = this.dialog.open(PgmtContratosModalComponent, {
      width: '100%',
      data: {}
    });
  }
}
