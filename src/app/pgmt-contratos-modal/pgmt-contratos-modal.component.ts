import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminPessoasComponent } from '../admin-pessoas/admin-pessoas.component';
import { PagamentosContratos } from '../classes/tableColumns';
import { TipoTextPipe } from '../pipes/tipo-text.pipe';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-pgmt-contratos-modal',
  templateUrl: './pgmt-contratos-modal.component.html',
  styleUrls: ['./pgmt-contratos-modal.component.scss']
})
export class PgmtContratosModalComponent implements OnInit {

  novoContratoForm: FormGroup;
  contratosPgmtForm: FormGroup;

  pagamentosContratos: Array<PagamentosContratos> = new Array();

  constructor(private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private server: ServerService,
    public dialogRef: MatDialogRef<AdminPessoasComponent>,
    @Inject(MAT_DIALOG_DATA) public Identificacao: number,
    private tipoPipe: TipoTextPipe) { }

  ngOnInit(): void {
    this.novoContratoForm = this.formBuilder.group({
      Identificacao: new FormControl({value: '', disabled: true}),
      Descricao: new FormControl({value: '', disabled: true}),
      Pessoa: new FormControl({value: '', disabled: true}),
      Valor: new FormControl({value: '', disabled: true}),
      Data_inicio: new FormControl({value: '', disabled: true}),
      CC: new FormControl({value: '', disabled: true}),
      Div_CC: new FormControl({value: '', disabled: true}),
      Data_termino: new FormControl({value: '', disabled: true}),
      Tipo: new FormControl({value: '', disabled: true})
    });

    this.getData();

  }

  getData() {
    this.server.get_Value({Identificacao: this.Identificacao},'contratos_query_get').then(response => {
      this.novoContratoForm.patchValue(response[0]);
      this.novoContratoForm.controls.Valor.patchValue(this.currencyPipe.transform(response[0].Valor ,'BRL','symbol','1.2-2'))
      this.novoContratoForm.controls.Tipo.patchValue(this.tipoPipe.transform(response[0].Tipo))
    })

    this.server.get_Value({Identificacao: this.Identificacao},'pagamentos_contratos_query').then((response: Array<PagamentosContratos>) => {

      response.forEach(element => {
        this.pagamentosContratos = [...this.pagamentosContratos, element]
      });
    })


  }

  onCancel(){
    this.dialogRef.close()
  }

}
