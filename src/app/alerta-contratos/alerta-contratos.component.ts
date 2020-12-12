import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertaContratos } from '../classes/tableColumns';
import { ServerService } from '../services/server.service';


@Component({
  selector: 'app-alerta-contratos',
  templateUrl: './alerta-contratos.component.html',
  styleUrls: ['./alerta-contratos.component.scss']
})
export class AlertaContratosComponent implements OnInit {

  AlertaContratos: Array<AlertaContratos> = [];

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

      console.log(this.AlertaContratos);
    })
  }

  onCancel(){
    this.dialogRef.close();
  }

}
