import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertaContratos } from '../classes/tableColumns';
import { PgmtContratosModalComponent } from '../pgmt-contratos-modal/pgmt-contratos-modal.component';
import { ServerService } from '../services/server.service';


@Component({
  selector: 'app-alerta-contratos',
  templateUrl: './alerta-contratos.component.html',
  styleUrls: ['./alerta-contratos.component.scss']
})
export class AlertaContratosComponent implements OnInit {

  AlertaContratos: Array<AlertaContratos> = [];
  AlertaContratos6Meses: Array<AlertaContratos> = [];

  label6Meses: String = "Final de Contrato ";
  labelTermino: String = "Reajuste de Aluguel ";

  dialogRefVisualizarContrato: MatDialogRef<PgmtContratosModalComponent>;

  constructor(
    private server: ServerService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AlertaContratosComponent>,
  ) { }

  ngOnInit(): void {

    this.server.get_List('contratos_alerta').then((response: any) => {

      response.forEach(element => {
        this.AlertaContratos = [...this.AlertaContratos, element];
      });

    })

    this.server.get_List('contratos_alerta_6_meses').then((response: any) => {

      response.forEach(element => {
        this.AlertaContratos6Meses = [...this.AlertaContratos6Meses, element];
      });

    })

    this.server.get_List('contagem_contratos_alerta').then((response) => {
      this.labelTermino = this.labelTermino + '(' + response[0].Contagem + ')';
    });
    this.server.get_List('contagem_contratos_alerta_6_meses').then((response) => {
      this.label6Meses = this.label6Meses + '(' + response[0].Contagem + ')';
    })

  }

  onCancel(){
    this.dialogRef.close();
  }

  viewContrato(IdentificacaoContrato){

    this.dialogRefVisualizarContrato = this.dialog.open(PgmtContratosModalComponent,{
      width: "100%",
      data: IdentificacaoContrato
    });

  }

}
