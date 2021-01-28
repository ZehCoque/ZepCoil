import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { CC, Contratos, div_CC, Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-novo-contrato',
  templateUrl: './novo-contrato.component.html',
  styleUrls: ['./novo-contrato.component.scss']
})
export class NovoContratoComponent implements OnInit {

    novoContrato: Contratos;
    novoContratoForm: FormGroup;
    contratosPgmtForm: FormGroup;
    loading: Boolean = false;

    CC:Array<CC> = new Array();
    div_CC:Array<div_CC> = new Array();
    Pessoa:Array<Pessoa> = new Array();

    div_cc_ready: boolean = false;

    error: string;

    Tipos = ['Fixo','Variável'];

    Favorecidos = ['Coil', 'Zep', 'MZ'];

    errorMatcher: ErrorMatcherDirective;


    today = moment().toISOString();

    constructor(private formBuilder: FormBuilder,
                private server: ServerService,
                public dialogRef: MatDialogRef<NovoContratoComponent>,
                @Inject(MAT_DIALOG_DATA) public preloaded,
                private currencyPipe: CurrencyPipe,
                private decimalPipe: DecimalPipe) { }

    ngOnInit(): void {
      this.dialogRef.disableClose = true;

      this.novoContratoForm = this.formBuilder.group({
        Identificacao: new FormControl('', Validators.required),
        Descricao: new FormControl('', Validators.required),
        Pessoa: new FormControl('', Validators.required),
        Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
        Data_inicio: new FormControl(moment().toISOString(), Validators.required),
        CC: new FormControl('',Validators.required),
        Div_CC: new FormControl('',Validators.required),
        Data_termino: new FormControl(moment().toISOString(), Validators.required),
        Tipo: new FormControl('',Validators.required)
      });

      this.contratosPgmtForm = this.formBuilder.group({
        DataPgto: new FormControl(moment().toISOString(), Validators.required),
        Fav1: new FormControl('Coil', Validators.required),
        Valor1: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'),Validators.required),
        ValorPiscina: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2')),
        Fav2: new FormControl(''),
        Valor2: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2')),
        Fav3: new FormControl(''),
        Valor3: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2')),
        FavCom: new FormControl('Marcia'),
        ValorCom: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2')),
        PCom: new FormControl(''),
      });


      this.novoContratoForm.valueChanges.subscribe(val => {
        if (val.Valor) {
          let valor = this.getNumberValue(val.Valor);
          this.novoContratoForm.patchValue({
            Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

      });

      this.contratosPgmtForm.valueChanges.subscribe(val => {
        if (val.Valor1) {
          let valor = this.getNumberValue(val.Valor1);
          this.contratosPgmtForm.patchValue({
            Valor1: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

        if (val.ValorPiscina) {
          let valor = this.getNumberValue(val.ValorPiscina);
          this.contratosPgmtForm.patchValue({
            ValorPiscina: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

        if (val.Valor2) {
          let valor = this.getNumberValue(val.Valor2);
          this.contratosPgmtForm.patchValue({
            Valor2: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

        if (val.Valor3) {
          let valor = this.getNumberValue(val.Valor3);
          this.contratosPgmtForm.patchValue({
            Valor3: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

        if (val.ValorCom) {
          let valor = this.getNumberValue(val.ValorCom);
          this.contratosPgmtForm.patchValue({
            ValorCom: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

      });



      if (this.preloaded){

        this.loadData(this.preloaded).then(() => {
          this.insertData();
        }).catch(err => console.log(err));
      } else {
        this.loadData();
      }


      this.loading = false;
      this.dialogRef.disableClose = false;

    }

    insertData(){

      this.novoContratoForm.patchValue(this.novoContrato);

      let current_CC = this.CC.find(value => value.Nome === this.novoContrato.CC)

      this.get_div_cc(this.novoContrato.CC).then(() => {

        this.novoContratoForm.controls.CC.setValue(current_CC);

        let current_div_CC = this.div_CC.find(value => value.Divisao === this.novoContrato.Div_CC)
        this.novoContratoForm.controls.Div_CC.patchValue(current_div_CC);

        let current_Pessoa = this.Pessoa.find(value => value.Nome === this.novoContrato.Pessoa)
        this.novoContratoForm.controls.Pessoa.patchValue(current_Pessoa);

      });
    }

    onSubmit(){
      this.loading = true;
      this.dialogRef.disableClose = true;
      this.error = '';

      let json: Contratos = {
        Identificacao: this.preloaded,
        Descricao: this.novoContratoForm.controls.Descricao.value,
        Pessoa: this.novoContratoForm.controls.Pessoa.value.Nome,
        Data_inicio: this.novoContratoForm.controls.Data_inicio.value,
        Data_termino: this.novoContratoForm.controls.Data_termino.value,
        Valor: this.getNumberValue(this.novoContratoForm.controls.Valor.value),
        CC: this.novoContratoForm.controls.CC.value.Nome,
        Div_CC: this.novoContratoForm.controls.Div_CC.value.Divisao,
        Tipo: this.novoContratoForm.controls.Tipo.value,
      }

      if (this.preloaded){

        this.server.update_List(json, 'contratos_query')
        .then(() => this.onCancel('novoContrato'))
        .catch(error => {
          this.loading = false;
          this.dialogRef.disableClose = false;
          console.log(error);
        })

      } else {



      }

    }

    loadData(ID?:number){
      let promise = new Promise<void>(async (resolve, reject) => {
      this.CC = new Array();
      this.div_CC = new Array();
      this.Pessoa = new Array();

      if (ID) {
        //GET A CONTRATO
        await this.server.get_Value({ID: ID},'contratos_query_get').then(async (response: any) => {
          this.novoContrato = response[0];

      }).catch(err => reject(err));
      }

        //GET ALL CC
        await this.server.get_List('cc_query').then(async (response: any) => {
          await response.forEach( (CC:CC) => {
            this.CC = [...this.CC, CC];
          });
        }).catch(err => reject(err));


        //GET ALL PESSOA
        await this.server.get_List('pessoa_query').then(async (response: any) => {
          await response.forEach( (Pessoa:Pessoa) => {
            this.Pessoa = [...this.Pessoa, Pessoa];
          });
        }).catch(err => reject(err));

        resolve();

      })

      return promise;
    }

    add_contrato(edit_json){

      let promise = new Promise<void>((resolve,reject) => {

        this.server.add_List(edit_json,'contratos_query_insert').then(() => {

          resolve();

        }).catch(error => {
          console.log(error);
          this.error = error;
        })
      })

        return promise;
    }

    get_div_cc(Nome_CC:String){
      this.div_CC = new Array<div_CC>();
      let promise = new Promise((resolve,reject) => {
        this.server.get_Value({Nome: Nome_CC},'div_cc_query').then(async (response: any) => {
        await response.forEach( (div_CC:div_CC) => {
          this.div_CC = [...this.div_CC, div_CC];
        });
        resolve(this.div_CC.length);
      }).catch(err => {
        this.div_cc_ready = false;
        reject(err);
      });
      })

      promise.then((div_cc_len) => {
        if (div_cc_len > 0){
          this.div_cc_ready = true;
        } else {
          this.div_cc_ready = false;
        }
      }).catch(() => this.div_cc_ready = false)

      return promise
    }


    onCancel(data?){
      this.dialogRef.close(data);
    }


    getNumberValue(value){

      if (typeof value == 'number') return value;

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

  }

