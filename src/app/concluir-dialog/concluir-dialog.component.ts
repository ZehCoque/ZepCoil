import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Entrada } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-concluir-dialog',
  templateUrl: './concluir-dialog.component.html',
  styleUrls: ['./concluir-dialog.component.scss']
})
export class ConcluirDialogComponent implements OnInit {

  doneForm: FormGroup;
  current_data: Entrada;
  loading: boolean = true;
  errorMatcher: ErrorMatcherDirective;
  error: string;

  constructor(private formBuilder: FormBuilder,
              private currencyPipe : CurrencyPipe,
              private server: ServerService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<ConcluirDialogComponent>) { }

  ngOnInit(): void {

    this.doneForm = this.formBuilder.group({
      Descricao: new FormControl({value: '', disabled: true}, Validators.required),
      Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl('', Validators.required),
      CC: new FormControl('',Validators.required),
      Div_CC: new FormControl(Number({value: '', disabled: true}),Validators.required),
      Vencimento: new FormControl('', Validators.required),
      Observacao: new FormControl({value: '', disabled: true}),
      N_Invest: new FormControl({value: '', disabled: true}, Validators.pattern("^[0-9]*$")),
      Responsavel: new FormControl({value: '', disabled: true},Validators.required),
      Tipo: new FormControl({value: '', disabled: true},Validators.required),
      Pessoa: new FormControl({value: '', disabled: true})
    });
    this.loadData(this.data.ID).then(() => {

      this.insertData();

      this.doneForm.valueChanges.subscribe(val => {
        if (val.Valor) {
          let valor;
          if (typeof val.Valor!= 'number'){
            valor = this.getNumberValue(val.Valor);
          }

          this.doneForm.patchValue({
            Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }
      });

      this.loading = false

    })


  }

  getNumberValue(value){
    let numberValue = value.replace(/\D/g,"");

    numberValue = [numberValue.slice(0, numberValue.length - 2), '.', numberValue.slice(numberValue.length - 2)].join('');
    if (numberValue.charAt(0) == '0'){
      numberValue = numberValue.slice(1);
    }
    if (numberValue.charAt(0) == '.'){
      numberValue = 0;
    }
    return numberValue;
  }

  insertData(){
    if (this.current_data.N_Invest) {
      if (this.current_data.N_Invest === 0) this.current_data.N_Invest = null;
    }

    this.doneForm.patchValue(this.current_data);

    this.doneForm.controls.Valor.setValue(this.currencyPipe.transform(this.current_data.Valor,'BRL','symbol','1.2-2'));

  }

  loadData(ID:number){
    let promise = new Promise(async (resolve, reject) => {

    await this.server.get_Value({ID: ID},'main_table_query_get').then(async (response: any) => {
      await response.forEach( (Entrada:Entrada) => {
        this.current_data = Entrada;
      });
    }).catch(err => reject(err));

      resolve();

    })

    return promise;
  }

  onCancel(data?){
    this.dialogRef.close(data);
  }

  onSubmit(){
    console.log(this.data.state)

    let json = {
      Valor: this.getNumberValue(this.doneForm.controls.Valor.value),
      Data_Entrada: moment(this.doneForm.get("Data_Entrada").value).toDate(),
      Vencimento: moment(this.doneForm.get("Vencimento").value).toDate(),
      Concluido: this.data.state,
      ID: this.data.ID,
    }

    this.server.update_List(json,'update_done_state_true').then(() => {
      this.onCancel('concluido')
    })
    .catch(error => {this.error = error})
   }

}
