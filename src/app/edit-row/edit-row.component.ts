import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { CC, div_CC, Entrada, Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-edit-row',
  templateUrl: './edit-row.component.html',
  styleUrls: ['./edit-row.component.scss']
})
export class EditRowComponent implements OnInit {
  @ViewChild('input') 
  Entradas: Array<Entrada> = new Array();

  editedEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  today = moment().toISOString();
  CC:Array<CC> = new Array();
  div_CC:Array<div_CC> = new Array<div_CC>();
  Pessoa:Array<Pessoa> = new Array();
  loading: boolean = true;
  div_cc_ready: boolean;

  current_data: Entrada;
  error: string;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    @Inject(MAT_DIALOG_DATA) public ID: number,
    public dialogRef: MatDialogRef<EditRowComponent>,
    private server: ServerService) { }

  ngOnInit()  {

    this.editedEntryForm = this.formBuilder.group({
      Descricao: new FormControl('', Validators.required),
      Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl('', Validators.required),
      CC: new FormControl('',Validators.required),
      Div_CC: new FormControl(Number(''),Validators.required),
      Vencimento: new FormControl('', Validators.required),
      Observacao: new FormControl(''),
      N_Invest: new FormControl('', Validators.pattern("^[0-9]*$")),
      Responsavel: new FormControl('',Validators.required),
      Tipo: new FormControl('',Validators.required),
      Pessoa: new FormControl('')
    });

    this.loadData(this.ID).then(() => {

      console.log(this.current_data)
      if (this.current_data.N_Invest === 0) {
        this.current_data.N_Invest = null;
      }

      this.editedEntryForm.patchValue(this.current_data);

      let current_CC = this.CC.find(value => value.Nome === this.current_data.CC)
      this.get_div_cc(current_CC.Nome);
      this.editedEntryForm.controls.CC.setValue(current_CC);

      let current_div_CC: div_CC = {
        Nome: current_CC.Nome,
        Divisao: this.current_data.Div_CC
      };

      this.editedEntryForm.controls.Div_CC.setValue(current_div_CC);

      this.editedEntryForm.controls.Valor.setValue(this.currencyPipe.transform(this.current_data.Valor,'BRL','symbol','1.2-2'))

      this.selectType(this.current_data.Tipo);
      this.selectResp(this.current_data.Responsavel);

      this.editedEntryForm.valueChanges.subscribe(val => {
        if (val.Valor) {
          let valor = this.getNumberValue(val.Valor);
          this.editedEntryForm.patchValue({
            Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }
      });

      this.loading = false
    })


  }

  selectType(type:number){
    this.editedEntryForm.controls.Tipo.setValue(type);
    if (type == 0){
      document.getElementsByName("addButton_edit")[0].style.opacity = "1";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("investButton_edit")[0].style.opacity = "0.4";
    }
    if (type == 1){
      document.getElementsByName("addButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "1";
      document.getElementsByName("investButton_edit")[0].style.opacity = "0.4";
    }
    if (type == 2){
      document.getElementsByName("addButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("investButton_edit")[0].style.opacity = "1";
    }
  }

  selectResp(resp:String){
    this.editedEntryForm.controls.Responsavel.setValue(resp);
    if (resp == "Coil"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "1";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "0.4";
    }
    if (resp == "Zep"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "1";
    }
  }

  onSubmit(){

    if (this.editedEntryForm.get("Pessoa").value == null) {
      this.editedEntryForm.controls.Pessoa.setValue(new Array(Entrada));
    }

    let edited_json: Entrada = {
      ID: this.ID,
      Descricao: this.editedEntryForm.get("Descricao").value,
      Data_Entrada: moment(this.editedEntryForm.get("Data_Entrada").value).toDate(),
      CC: this.editedEntryForm.get("CC").value,
      Div_CC: this.editedEntryForm.get("Div_CC").value,
      Vencimento: moment(this.editedEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.editedEntryForm.get("Valor").value),
      Observacao: this.editedEntryForm.get("Observacao").value,
      Tipo: this.editedEntryForm.get("Tipo").value,
      Responsavel: this.editedEntryForm.get("Responsavel").value,
      N_Invest: Number(this.editedEntryForm.get("N_Invest").value),
      Pessoa: this.editedEntryForm.get("Pessoa").value.Nome
    }

    this.server.update_List(edited_json,'main_table_query').then(() => {

      this.dialogRef.close();

    }).catch((err) => {
      console.log(err);
      this.error = err;
    })

  }

  onClear(){
    this.editedEntryForm.reset();

    let reset_data = this.current_data;

    delete reset_data.ID;

    this.editedEntryForm.setValue(reset_data);
  }

  Cancel(){
    this.dialogRef.close();
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

  loadData(ID:number){
    let promise = new Promise(async (resolve, reject) => {
    this.CC = new Array();
    this.div_CC = new Array();
    this.Pessoa = new Array();

    await this.server.get_Value({ID: ID},'main_table_query_get').then(async (response: any) => {
      await response.forEach( (Ëntrada:Entrada) => {
        this.current_data = Ëntrada;
      });
    }).catch(err => reject(err));

      //GET ALL CC
      await this.server.get_List('cc_query').then(async (response: any) => {
        await response.forEach( (CC:CC) => {
          this.CC = [...this.CC, CC];
        });
      }).catch(err => reject(err));

      await this.server.get_List('pessoa_query').then(async (response: any) => {
        await response.forEach( (Pessoa:Pessoa) => {
          this.Pessoa = [...this.Pessoa, Pessoa];
        });
      }).catch(err => reject(err));

      resolve();

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

}
