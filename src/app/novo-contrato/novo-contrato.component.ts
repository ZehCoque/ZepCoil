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
    loading: Boolean = true;

    CC:Array<CC> = new Array();
    div_CC:Array<div_CC> = new Array();
    Pessoa:Array<Pessoa> = new Array();

    div_cc_ready: boolean = false;

    error: string;

    Tipos = ['Fixo','Variável'];

    errorMatcher: ErrorMatcherDirective;


    today = moment().toISOString();

    constructor(private formBuilder: FormBuilder,
                private server: ServerService,
                public dialogRef: MatDialogRef<NovoContratoComponent>,
                @Inject(MAT_DIALOG_DATA) public preloaded,
                private currencyPipe: CurrencyPipe,
                private decimalPipe: DecimalPipe) { }

    ngOnInit(): void {

      this.novoContratoForm = this.formBuilder.group({
        Descricao: new FormControl('', Validators.required),
        Pessoa: new FormControl('', Validators.required),
        Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
        Data_inicio: new FormControl(moment().toISOString(), Validators.required),
        CC: new FormControl('',Validators.required),
        Div_CC: new FormControl('',Validators.required),
        Data_termino: new FormControl(moment(this.today).add(1, 'M').toISOString(), Validators.required),
        Tipo: new FormControl('',Validators.required),
        PZep: new FormControl(this.decimalPipe.transform(0.00,'1.2-2')),
        PCoil: new FormControl(this.decimalPipe.transform(0.00,'1.2-2')),
        PComissao: new FormControl(this.decimalPipe.transform(0.00,'1.2-2'))
      });


      this.novoContratoForm.valueChanges.subscribe(val => {
        if (val.Valor) {
          let valor = this.getNumberValue(val.Valor);
          this.novoContratoForm.patchValue({
            Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }

        if (val.PZep) {
          let valor = this.getNumberValue(val.PZep);
          this.novoContratoForm.patchValue({
            PZep: this.decimalPipe.transform(valor,'1.2-2') },
            {emitEvent:false})
        }

        if (val.PCoil) {
          let valor = this.getNumberValue(val.PCoil);
          this.novoContratoForm.patchValue({
            PCoil: this.decimalPipe.transform(valor,'1.2-2') },
            {emitEvent:false})
        }

        if (val.PComissao) {
          let valor = this.getNumberValue(val.PComissao);
          this.novoContratoForm.patchValue({
            PComissao: this.decimalPipe.transform(valor,'1.2-2') },
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
      this.error = '';

      let json: Contratos = {
        ID: this.preloaded,
        Descricao: this.novoContratoForm.controls.Descricao.value,
        Pessoa: this.novoContratoForm.controls.Pessoa.value.Nome,
        Data_inicio: this.novoContratoForm.controls.Data_inicio.value,
        Data_termino: this.novoContratoForm.controls.Data_termino.value,
        Valor: this.getNumberValue(this.novoContratoForm.controls.Valor.value),
        CC: this.novoContratoForm.controls.CC.value.Nome,
        Div_CC: this.novoContratoForm.controls.Div_CC.value.Divisao,
        Tipo: this.novoContratoForm.controls.Tipo.value,
        PCoil: this.getNumberValue(this.novoContratoForm.controls.PCoil.value),
        PZep: this.getNumberValue(this.novoContratoForm.controls.PZep.value),
        PComissao: this.getNumberValue(this.novoContratoForm.controls.PComissao.value),
      }

      if (this.preloaded){

        this.server.update_List(json, 'contratos_query')
        .then(() => this.onCancel('novoContrato'))
        .catch(error => console.log(error));

      } else {

        this.server.get_List('max_id').then((results) => {
          json.ID = results[0].max_id + 1

          this.add_contrato(json).then(() => {
            this.onCancel('novoContrato');

        })


        })

      }

    }

    loadData(ID?:number){
      let promise = new Promise(async (resolve, reject) => {
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

      let promise = new Promise((resolve,reject) => {

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
      console.log(numberValue)
      return numberValue;
    }

  }

