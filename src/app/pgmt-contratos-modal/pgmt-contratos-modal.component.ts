import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PagamentosContratos } from '../classes/tableColumns';
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
    @Inject(MAT_DIALOG_DATA) public Identificacao: number) { }

  ngOnInit(): void {
    console.log(this.Identificacao)
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
    })

    this.server.get_Value({Identificacao: this.Identificacao},'pagamentos_contratos_query').then((response: Array<PagamentosContratos>) => {

      response.forEach(element => {
        this.pagamentosContratos = [...this.pagamentosContratos, element]
        console.log(this.pagamentosContratos)
      });
    })


  }

  onCancel(): void {

  }

}
