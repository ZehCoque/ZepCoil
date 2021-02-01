import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { CC, Contratos, div_CC, PagamentosContratos, Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { TipoTextPipe } from '../pipes/tipo-text.pipe';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-novo-contrato',
  templateUrl: './novo-contrato.component.html',
  styleUrls: ['./novo-contrato.component.scss']
})
export class NovoContratoComponent implements OnInit {

    novoContrato: Contratos;
    pagamentosContratos: Array<PagamentosContratos> = new Array();

    novoContratoForm: FormGroup;
    contratosPgmtForm: FormGroup;

    loading: Boolean = false;
    loading_ctrlpgmt: Boolean = false;

    CC:Array<CC> = new Array();
    div_CC:Array<div_CC> = new Array();
    Pessoa:Array<Pessoa> = new Array();

    div_cc_ready: boolean = false;

    error: string;

    Tipo_despesa = [
      {
        text: 'Fixa',
        value: 'F'
      },
      {
        text: 'AirBnb',
        value: 'A'
      },
      {
        text: 'Contrato',
        value: 'C'
      },
    ];

    Favorecidos = ['Coil', 'Zep', 'MZ'];
    Favorecidos2 = ['Não há','Coil', 'Zep', 'MZ'];
    FavoricidosComissao = ['Não há', 'Marcia'];

    errorMatcher: ErrorMatcherDirective;


    today = moment().toISOString();
    dataPgmtError: boolean = false;

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
        Div_CC: new FormControl({value: '', disabled: true},Validators.required),
        Data_termino: new FormControl(moment().toISOString(), Validators.required),
        Tipo: new FormControl('',Validators.required)
      });

      this.contratosPgmtForm = this.formBuilder.group({
        DataPgto: new FormControl(moment().toISOString(), Validators.required),
        Fav1: new FormControl('Coil', Validators.required),
        Valor1: new FormControl('',Validators.required),
        ValorPiscina: new FormControl(''),
        Fav2: new FormControl('Não há'),
        Valor2: new FormControl({value: '', disabled: true}),
        Fav3: new FormControl('Não há'),
        Valor3: new FormControl({value: '', disabled: true}),
        FavCom: new FormControl('Não há'),
        ValorCom: new FormControl({value: '', disabled: true}),
        PCom: new FormControl({value: '', disabled: true}),
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
          this.novoContratoForm.controls.Identificacao.disable();
        }).catch(err => console.log(err));
      } else {
        this.loadData();
      }


      this.loading = false;
      this.dialogRef.disableClose = false;

    }

    insertData(){

      this.novoContratoForm.patchValue(this.novoContrato);

      let current_Tipo = this.Tipo_despesa.find(value=> value.value === this.novoContrato.Tipo)
      this.novoContratoForm.controls.Tipo.setValue(current_Tipo);

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
        Identificacao: this.novoContratoForm.controls.Identificacao.value,
        Descricao: this.novoContratoForm.controls.Descricao.value,
        Pessoa: this.novoContratoForm.controls.Pessoa.value.Nome,
        Data_inicio: this.novoContratoForm.controls.Data_inicio.value,
        Data_termino: this.novoContratoForm.controls.Data_termino.value,
        Valor: this.getNumberValue(this.novoContratoForm.controls.Valor.value),
        CC: this.novoContratoForm.controls.CC.value.Nome,
        Div_CC: this.novoContratoForm.controls.Div_CC.value.Divisao,
        Tipo: this.novoContratoForm.controls.Tipo.value.value,
      }

      if(!this.preloaded) {
        this.add_contrato(json).then(() => {
          this.loading = false;
          this.onCancel('novoContrato');
        });

      } else if (this.preloaded) {
        //EDITAR O CONTRATO
        this.server.update_List(json, 'contratos_query')
        .then(() => {
          this.server.delete_List({Identificacao: this.preloaded},'pagamentos_contratos_query').then(() => {

            this.pagamentosContratos.forEach(async (element) => {
              await this.server.add_List(element,'pagamentos_contratos_query_insert').catch((err) =>{
                this.loading = false;
                this.dialogRef.disableClose = false;
                console.log(err);
              });

              this.onCancel('novoContrato');

            });

          }) .catch(error => {
          this.loading = false;
          this.dialogRef.disableClose = false;
          console.log(error);
        })
        }).catch(error => {
          this.loading = false;
          this.dialogRef.disableClose = false;
          console.log(error);
        })
      }

    }

    loadData(Identificacao?: String){
      let promise = new Promise<void>(async (resolve, reject) => {
      this.CC = new Array();
      this.div_CC = new Array();
      this.Pessoa = new Array();

      if (Identificacao) {
        //GET A CONTRATO
        await this.server.get_Value({Identificacao: this.preloaded},'contratos_query_get').then(async (response: any) => {
          this.novoContrato = response[0];

        }).catch(err => reject(err));

        //GET A CONTRATO
        await this.server.get_Value({Identificacao: this.preloaded},'pagamentos_contratos_query').then(async (response: any) => {
          response.forEach(element => {
            this.pagamentosContratos = [...this.pagamentosContratos, element]
          });

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

    add_contrato(json){

      let promise = new Promise<void>((resolve,reject) => {

        this.server.add_List(json,'contratos_query_insert').then(() => {
          this.pagamentosContratos.forEach(async (element) => {
            await this.server.add_List(element,'pagamentos_contratos_query_insert').catch((err) =>{
              console.log(err);
              err => this.error = err
            });
          })
          resolve();

        }).catch(error => {
          console.log(error);
          this.error = error;
          this.loading = false;
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
          this.novoContratoForm.controls.Div_CC.enable();
        } else {
          this.novoContratoForm.controls.Div_CC.disable();
        }
      }).catch(() => this.novoContratoForm.controls.Div_CC.disable())

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

    onResetPgmts(){
      this.contratosPgmtForm.reset();
      this.contratosPgmtForm.controls.DataPgto.patchValue(moment().toISOString());
      this.contratosPgmtForm.controls.Fav1.patchValue('Coil');
      this.contratosPgmtForm.controls.Fav2.patchValue('Não há');
      this.contratosPgmtForm.controls.Fav3.patchValue('Não há');
      this.contratosPgmtForm.controls.Valor1.patchValue('');
      this.contratosPgmtForm.controls.ValorPiscina.patchValue('');
      this.contratosPgmtForm.controls.Valor2.patchValue('');
      this.contratosPgmtForm.controls.Valor3.patchValue('');
      this.contratosPgmtForm.controls.ValorCom.patchValue('');
      this.contratosPgmtForm.controls.FavCom.patchValue('Não há');
      this.contratosPgmtForm.get('Valor1').markAsUntouched();
      this.contratosPgmtForm.get('Valor2').disable();
      this.contratosPgmtForm.get('Valor3').disable();
      this.contratosPgmtForm.get('ValorCom').disable();
      this.contratosPgmtForm.get('PCom').disable();
    }

    async inserirPgmt(): Promise<void> {

      this.dataPgmtError = false;
      this.pagamentosContratos.forEach(async (element) => {
        if (moment(element.DataPgto).startOf('day').toString() == moment(this.contratosPgmtForm.controls.DataPgto.value).startOf('day').toString()) {
          this.dataPgmtError = true;
        }
      })

      if (this.dataPgmtError) return;

      let json: PagamentosContratos = {
        Identificacao: this.novoContratoForm.controls.Identificacao.value,
        DataPgto: moment(this.contratosPgmtForm.controls.DataPgto.value).startOf('day').toDate(),
        Fav1: this.contratosPgmtForm.controls.Fav1.value,
        Valor1: this.getNumberValue(this.contratosPgmtForm.controls.Valor1.value),
        ValorPiscina: this.getNumberValue(this.contratosPgmtForm.controls.ValorPiscina.value)  || null,
        Fav2: this.contratosPgmtForm.controls.Fav2.value || null,
        Valor2: this.getNumberValue(this.contratosPgmtForm.controls.Valor2.value) || null,
        Fav3: this.contratosPgmtForm.controls.Fav3.value || null,
        Valor3: this.getNumberValue(this.contratosPgmtForm.controls.Valor3.value) || null,
        FavCom: this.contratosPgmtForm.controls.FavCom.value || null,
        ValorCom: this.getNumberValue(this.contratosPgmtForm.controls.ValorCom.value)  || null,
        PCom: this.contratosPgmtForm.controls.PCom.value || null,
      }

      if (json.Fav2 == 'Não há') json.Fav2 = '';
      if (json.Fav3 == 'Não há') json.Fav3 = '';
      if (json.FavCom == 'Não há') json.FavCom = '';

      this.pagamentosContratos = [... this.pagamentosContratos, json];

      this.onResetPgmts();
    }

    //Disativa campos para cada Valor dos Favorecidos
    checkDisableAttr(event, favorecidoNum) {

      if (event.srcElement.innerHTML.includes('Não há')) {
        this.contratosPgmtForm.get('Valor' + favorecidoNum).setValue('');
        this.contratosPgmtForm.get('Valor' + favorecidoNum).disable();

        if (favorecidoNum == 'Com') {
          this.contratosPgmtForm.get('P' + favorecidoNum).setValue('');
          this.contratosPgmtForm.get('P' + favorecidoNum).disable();
        }

      } else {
        this.contratosPgmtForm.get('Valor' + favorecidoNum).setValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));
        this.contratosPgmtForm.get('Valor' + favorecidoNum).enable();

        if (favorecidoNum == 'Com') {
          this.contratosPgmtForm.get('P' + favorecidoNum).enable();
        }

      }

    }

  }

