import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CC, div_CC, Entrada, Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { AppRoutingService } from '../services/app-routing-service.service';
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
  loading: boolean = false;
  loading_page: boolean = true;

  div_cc_ready: boolean = true;

  Contratos: Array<String> = new Array();
  DataPgtoContrato: Array<String> = new Array();

  filteredOptions_Contratos: Observable<String[]>;

  current_data: Entrada;
  error: string;
  state: any;

  Imposto = [
    {
      text: 'Sem imposto',
      value: 0
    },
    {
      text: 'Com imposto',
      value: 1
    },
  ];
  Tipo_despesa = [
    {
      text: 'Fixa',
      value: 'F'
    },
    {
      text: 'Variável',
      value: 'V'
    },
  ];

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    @Inject(MAT_DIALOG_DATA) public ID: number,
    public dialogRef: MatDialogRef<EditRowComponent>,
    private server: ServerService,
    private routingService: AppRoutingService) { }

  ngOnInit()  {
    this.dialogRef.disableClose = true;
    this.state = this.routingService.getRouteTitle();

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
      Pessoa: new FormControl(''),
      Imposto: new FormControl(''),
      Tipo_despesa: new FormControl(''),
      Contrato: new FormControl(''),
      DataPgtoContrato: new FormControl({value: '', disabled: true}),
    });

    this.loadData(this.ID).then(() => {

      this.loading_page = false;
      this.insertData();

      this.editedEntryForm.valueChanges.subscribe(val => {
        if (val.Valor) {
          let valor;
          if (typeof val.Valor!= 'number'){
            valor = this.getNumberValue(val.Valor);
          }

          this.editedEntryForm.patchValue({
            Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
            {emitEvent:false})
        }
      });
      this.dialogRef.disableClose = false;

    })

    this.editedEntryForm.controls.Contrato.valueChanges.subscribe(() => {
      if (this.editedEntryForm.controls.Contrato.value == '') {
        this.editedEntryForm.controls.DataPgtoContrato.setValidators([]);
        this.editedEntryForm.controls.DataPgtoContrato.updateValueAndValidity();
        this.editedEntryForm.controls.DataPgtoContrato.setValue('')
      } else {
        this.editedEntryForm.controls.DataPgtoContrato.setValidators([Validators.required]);
        this.editedEntryForm.controls.DataPgtoContrato.updateValueAndValidity();
      }
    });


  }

  initFilter(){
    this.filteredOptions_Contratos = this.editedEntryForm.controls.Contrato.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: String): Array<String> {
    const filterValue = value.toString().toLowerCase();
    return this.Contratos.filter(option => option.toString().toLowerCase().includes(filterValue));
  }

  insertData(){
    if (this.current_data.N_Invest) {
      if (this.current_data.N_Invest === '0') this.current_data.N_Invest = null;
    }

    this.editedEntryForm.patchValue(this.current_data);

    let current_CC = this.CC.find(value => value.Nome === this.current_data.CC)

    this.get_div_cc(current_CC.Nome).then(() => {

      this.editedEntryForm.controls.CC.setValue(current_CC);

      let current_div_CC = this.div_CC.find(value => value.Divisao === this.current_data.Div_CC)
      this.editedEntryForm.controls.Div_CC.patchValue(current_div_CC);

      let current_Pessoa = this.Pessoa.find(value => value.Nome === this.current_data.Pessoa)
      this.editedEntryForm.controls.Pessoa.patchValue(current_Pessoa);

    });

    if (this.current_data.Tipo_despesa != null) {
      let current_Tipo_despesa = this.Tipo_despesa.find(value => value.value === this.current_data.Tipo_despesa);
      this.editedEntryForm.controls.Tipo_despesa.patchValue(current_Tipo_despesa);
    } else {
      this.current_data.Tipo_despesa = "F"
      let current_Tipo_despesa = this.Tipo_despesa.find(value => value.value === this.current_data.Tipo_despesa);
      this.editedEntryForm.controls.Tipo_despesa.patchValue(current_Tipo_despesa);
    }

    if (this.current_data.Imposto) {
      let current_Imposto = this.Imposto.find(value => value.value === this.current_data.Imposto);
      this.editedEntryForm.controls.Imposto.patchValue(current_Imposto);
    } else {
      this.current_data.Imposto = 0;
      let current_Imposto = this.Imposto.find(value => value.value === this.current_data.Imposto);
      this.editedEntryForm.controls.Imposto.patchValue(current_Imposto);
    }

    this.editedEntryForm.controls.Valor.setValue(this.currencyPipe.transform(this.current_data.Valor,'BRL','symbol','1.2-2'));

    this.selectType(this.current_data.Tipo);
    this.selectResp(this.current_data.Responsavel);
  }

  selectType(type:Number){
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
    if (type == 3){
      document.getElementsByName("inButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("outButton_edit")[0].style.opacity = "1";
    }
    if (type == 4){
      document.getElementsByName("inButton_edit")[0].style.opacity = "1";
      document.getElementsByName("outButton_edit")[0].style.opacity = "0.4";
    }
  }

  selectResp(resp:String){
    this.editedEntryForm.controls.Responsavel.setValue(resp);
    if (resp == "Coil"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "1";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("MButton_edit")[0].style.opacity = "0.4";
    }
    if (resp == "Zep"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "1";
      document.getElementsByName("MButton_edit")[0].style.opacity = "0.4";
    }
    if (resp == "MZ"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("MButton_edit")[0].style.opacity = "1";
    }
  }

  onSubmit(){
    this.loading = true;
    this.dialogRef.disableClose = true;
    this.error ='';
    if (this.editedEntryForm.get("Pessoa").value == null) {
      this.editedEntryForm.controls.Pessoa.setValue(new Array(Entrada));
    }

    let imp = null;
    let desp = '';

    if (this.editedEntryForm.get("Tipo").value == 0){
      imp = this.editedEntryForm.get("Imposto").value.value;
    }

    if (this.editedEntryForm.get("Tipo").value == 1){
      desp = this.editedEntryForm.get("Tipo_despesa").value.value;
    }

    if (this.editedEntryForm.get("Contrato").value == '') this.editedEntryForm.get("Contrato").setValue(null);
    if (this.editedEntryForm.get("DataPgtoContrato").value == '') this.editedEntryForm.get("DataPgtoContrato").setValue(null);

    let edited_json: Entrada = {
      ID: this.ID,
      Descricao: this.editedEntryForm.get("Descricao").value,
      Data_Entrada: moment(this.editedEntryForm.get("Data_Entrada").value).startOf('day').toDate(),
      CC: this.editedEntryForm.get("CC").value.Nome,
      Div_CC: this.editedEntryForm.get("Div_CC").value.Divisao,
      Vencimento: moment(this.editedEntryForm.get("Vencimento").value).startOf('day').toDate(),
      Valor:  this.getNumberValue(this.editedEntryForm.get("Valor").value),
      Observacao: this.editedEntryForm.get("Observacao").value,
      Tipo: this.editedEntryForm.get("Tipo").value,
      Responsavel: this.editedEntryForm.get("Responsavel").value,
      N_Invest: this.editedEntryForm.get("N_Invest").value,
      Pessoa: this.editedEntryForm.get("Pessoa").value.Nome,
      Concluido: this.current_data.Concluido,
      Imposto: imp,
      Tipo_despesa: desp,
      Contrato: this.editedEntryForm.get("Contrato").value,
      DataPgtoContrato: this.editedEntryForm.get("DataPgtoContrato").value,
    }

    this.server.update_List(edited_json,'main_table_query').then(() => {

      this.onCancel('editedRow');

    }).catch((err) => {
      console.log(err);
      this.loading = false;
      this.dialogRef.disableClose = false;
      this.error = err;
    })

  }

  onReset(){
    this.insertData();
  }

  onCancel(data?){
    this.dialogRef.close(data);
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
    let promise = new Promise<void>(async (resolve, reject) => {
    this.CC = new Array();
    this.div_CC = new Array();
    this.Pessoa = new Array();

    await this.server.get_Value({ID: ID},'main_table_query_get').then(async (response: any) => {
      await response.forEach( (Entrada:Entrada) => {
        this.current_data = Entrada;
        console.log(this.current_data)
        if (this.current_data.Contrato) this.get_DataPgtoContrato(this.current_data.Contrato);
      });
    }).catch(err => reject(err));

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

      //GET ALL CONTRATOS
      await this.server.get_List('contratos_unique').then(async (response: any) => {
        await response.forEach((element) => {
          this.Contratos = [...this.Contratos, element.Identificacao];
        });
      }).catch(err => reject(err));

      resolve();

    })

    return promise;
  }

  async get_DataPgtoContrato(id){
    this.DataPgtoContrato = new Array();
    await this.server.get_Value({Identificacao: id},'pagamentos_contratos_query').then((response:any) => {
      response.forEach(element => {
        this.DataPgtoContrato = [...this.DataPgtoContrato, element.DataPgto];
      });
    })
    if (this.DataPgtoContrato.length > 0) this.editedEntryForm.controls.DataPgtoContrato.enable();
    else this.editedEntryForm.controls.DataPgtoContrato.disable();
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
