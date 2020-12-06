import { Component, Inject, OnInit } from '@angular/core';
import { ServerService } from '../services/server.service';
import { Entrada } from '../classes/tableColumns';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface struct {
  Valor: String,
  Data_Entrada: Date,
  Vencimento: Date
}

@Component({
  selector: 'app-historico-dialog',
  templateUrl: './historico-dialog.component.html',
  styleUrls: ['./historico-dialog.component.scss']
})
export class HistoricoDialogComponent implements OnInit {
  lancamentos: Entrada;
  historico: Entrada;

  Descricao: String;

  before: struct = {
    Valor: '',
    Data_Entrada: new Date(),
    Vencimento: new Date()
  };

  after: struct = {
    Valor: '',
    Data_Entrada: new Date(),
    Vencimento: new Date()
  };

  constructor(private server: ServerService,
              @Inject(MAT_DIALOG_DATA) public ID: number,
              public dialogRef: MatDialogRef<HistoricoDialogComponent>,) { }

  ngOnInit(): void {

    this.loadData(this.ID).then(() => {
      this.Descricao = this.lancamentos.Descricao;

      this.before.Valor = this.lancamentos.Valor;
      this.before.Data_Entrada = this.lancamentos.Data_Entrada;
      this.before.Vencimento = this.lancamentos.Vencimento;

      this.after.Valor = this.historico.Valor;
      this.after.Data_Entrada = this.historico.Data_Entrada;
      this.after.Vencimento = this.historico.Vencimento;

    })

  }

  loadData(ID:number){
    let promise = new Promise(async (resolve, reject) => {

    await this.server.get_Value({ID: ID},'main_table_query_get').then(async (response: any) => {
      await response.forEach( (Entrada:Entrada) => {
        this.lancamentos = Entrada;
      });
    }).catch(err => reject(err));

    await this.server.get_Value({ID: ID},'historico_query').then(async (response: any) => {
      await response.forEach( (Entrada:Entrada) => {
        this.historico = Entrada;
      });
    }).catch(err => reject(err));

      resolve();

    })

    return promise;
  }

  onCancel(){
    this.dialogRef.close();
  }

}
