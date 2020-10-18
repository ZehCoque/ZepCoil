import { Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive'
import { CurrencyPipe } from '@angular/common';
import { ServerService } from '../services/server.service'
import { CC, div_CC, Entrada, Pessoa } from '../classes/tableColumns'

import * as moment from 'moment';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditRowComponent } from '../edit-row/edit-row.component';
import { ActiveFilters, ActiveSorts, SortMessages } from '../classes/active_filters_and_sorts';
import { newDataTrackerService } from '../services/new-data-tracker.service';

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})
export class LancamentosComponent implements OnInit {

  @ViewChild('contextMenuTrigger') contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };
  changeDetection: ChangeDetectionStrategy.OnPush;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  newEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  loading = true;
  today = moment().toISOString();

  Entradas: Array<Entrada> = new Array();
  filterValues: Array<string>;
  CC:Array<CC> = new Array();
  div_CC:Array<div_CC> = new Array<div_CC>();
  Pessoa:Array<Pessoa> = new Array();

  cdk_empty: boolean = true;
  div_cc_ready: boolean = false;

  activeSorts: ActiveSorts = new ActiveSorts;
  activeFilters: ActiveFilters = new ActiveFilters;
  sortMessages: SortMessages = new SortMessages;

  editRowDialogRef: MatDialogRef<EditRowComponent>;
  currentActiveSort: string;
  currentActiveFilter: string;
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  totalInvestimentos: number = 0;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService) { }

  ngOnInit()  {

    this.newEntryForm = this.formBuilder.group({
      Descricao: new FormControl('', Validators.required),
      Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl(moment().toISOString(), Validators.required),
      CC: new FormControl('',Validators.required),
      Div_CC: new FormControl('',Validators.required),
      Vencimento: new FormControl(moment(this.today).add(1, 'M').toISOString(), Validators.required),
      Observacao: new FormControl(''),
      N_Invest: new FormControl('', Validators.pattern("^[0-9]*$")),
      Responsavel: new FormControl('',Validators.required),
      Tipo: new FormControl('',Validators.required),
      Pessoa: new FormControl('')
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      if (val.Valor) {
        let valor = this.getNumberValue(val.Valor);
        this.newEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

    this.loadData().then(() =>{
      this.cdk_empty = false;
      this.loading = false;

    }).catch(err => console.log(err))

    this.newDataEmitter.currentData.subscribe(() => {
      this.loadData();
    })
  }

  loadData(){
    let promise = new Promise(async (resolve, reject) => {

      //GET ALL ENTRADAS
      await this.server.get_List('main_table_query').then(async (response: any) => {
          await response.forEach( (element:Entrada) => {
            this.Entradas = [...this.Entradas, element];
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

        await this.updateSoma()

        resolve();

    })

    return promise;
  }

  get_div_cc(Nome_CC:string){
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

  async getColumnValues(column:string) {
    this.filterValues = new Array<string>();
    await this.server.get_Value({column: column, active_filters: this.activeFilters},'column_value').then(async (element: any) => {
      await element.forEach(el => {
        this.filterValues = [...this.filterValues, el[column]]
      });

    });
    return this.filterValues
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

  scroll_func(event){
    console.log(event)
  }

  resetValue(){
    this.newEntryForm.controls.valor.setValue(
      "",
      {emitEvent: false}
    );
  }

  onSubmit(){

    let input_json: Entrada = {
      Descricao: this.newEntryForm.get("Descricao").value,
      Data_Entrada: moment(this.newEntryForm.get("Data_Entrada").value).toDate(),
      CC: this.newEntryForm.get("CC").value.Nome,
      Div_CC: this.newEntryForm.get("Div_CC").value.Divisao,
      Vencimento: moment(this.newEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.newEntryForm.get("Valor").value),
      Observacao: this.newEntryForm.get("Observacao").value,
      Tipo: this.newEntryForm.get("Tipo").value,
      Responsavel: this.newEntryForm.get("Responsavel").value,
      N_Invest: Number(this.newEntryForm.get("N_Invest").value),
      Pessoa: this.newEntryForm.get("Pessoa").value.Nome
    }

    this.onClear();
    console.log(input_json)
    this.Entradas = [...this.Entradas, input_json]
    this.cdk_empty = false;
    if (this.Entradas.length > 1) this.viewport.scrollToIndex(this.Entradas.length + 1);

    this.server.add_List(input_json,'main_table_query').then(res => {
      this.updateSoma();
    });

  }

  onClear(){
    this.newEntryForm.reset();
    this.newEntryForm.controls.Valor.patchValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));
    this.newEntryForm.controls.Data_Entrada.patchValue(moment().toISOString());
    this.newEntryForm.controls.Vencimento.patchValue(moment(this.today).add(1, 'M').toISOString());
    document.getElementsByName("addButton")[0].style.opacity = "0.4";
    document.getElementsByName("removeButton")[0].style.opacity = "0.4";
    document.getElementsByName("investButton")[0].style.opacity = "0.4";
    document.getElementsByName("CButton")[0].style.opacity = "0.4";
    document.getElementsByName("ZButton")[0].style.opacity = "0.4";
    this.newEntryForm.untouched;
  }

  onContextMenu(event: MouseEvent, item, index) {

    event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = { 'item': item, 'index': index };
      this.contextMenu.openMenu();

  }

  selectType(type:number){
    this.newEntryForm.controls.Tipo.setValue(type);
    if (type == 0){
      document.getElementsByName("addButton")[0].style.opacity = "1";
      document.getElementsByName("removeButton")[0].style.opacity = "0.4";
      document.getElementsByName("investButton")[0].style.opacity = "0.4";
    }
    if (type == 1){
      document.getElementsByName("addButton")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton")[0].style.opacity = "1";
      document.getElementsByName("investButton")[0].style.opacity = "0.4";
    }
    if (type == 2){
      document.getElementsByName("addButton")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton")[0].style.opacity = "0.4";
      document.getElementsByName("investButton")[0].style.opacity = "1";
    }
  }

  selectResp(resp:string){
    this.newEntryForm.controls.Responsavel.setValue(resp);
    if (resp == "Coil"){
      document.getElementsByName("CButton")[0].style.opacity = "1";
      document.getElementsByName("ZButton")[0].style.opacity = "0.4";
    }
    if (resp == "Zep"){
      document.getElementsByName("CButton")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton")[0].style.opacity = "1";
    }
  }

  editLine(item, row){
    this.editRowDialogRef = this.dialog.open(EditRowComponent,{
      width: "50%",
      data: item
    });

    let sub = this.editRowDialogRef.afterClosed().subscribe(editedData => {

      if (editedData != item && editedData != undefined){

        editedData = {...editedData, ...{['ID']: this.Entradas[row].ID}};
        this.Entradas[row] = editedData;
        this.Entradas = [...this.Entradas]


        this.server.update_List(this.Entradas[row],'main_table_query').then(() => {
          this.updateSoma();
          sub.unsubscribe();
        });
      }
    });
  }

  deleteLine(item, row){
    this.Entradas = this.Entradas.filter((item, index) => index !== row)
    this.server.delete_List(item,'main_table_query').then(() =>{
      if (this.Entradas.length == 0) this.cdk_empty = true;
      this.updateSoma();
    })
   }

   moveCursorToEnd(el) {
     console.log(el)
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
  }

  async sortBy(column: string, sort_dir: string){
    this.loading = true;
    if (this.currentActiveSort){
      this.activeSorts[this.currentActiveSort].active = false;
    }

    this.activeSorts[column].active = true;
    if (sort_dir == 'ASC'){
      this.activeSorts[column].dir = 'arrow_downward';
    } else {
      this.activeSorts[column].dir = 'arrow_upward';
    }

    this.currentActiveSort = column;

    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'main_table_query_CF').then(async (response: any) => {
      this.Entradas = [];
      await response.forEach( (element:Entrada) => {
        this.Entradas = [...this.Entradas, element];

      });

    });

    if (this.Entradas.length > 0) {
      this.cdk_empty = false;
    }

    this.loading = false;
  }

  async filterBy(column: string, selected: string) {
    this.loading = true
    this.activeFilters[column] = String(selected);
    this.Entradas = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'main_table_query_CF').then(async (element: any) => {
      await element.forEach(entrada => {
        this.Entradas = [...this.Entradas, entrada]
      });
      this.updateSoma();
    })
    this.loading = false

  }

  async clearFilter(column: string){
    this.loading = true
    this.activeFilters[column] = '';
    this.Entradas = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'main_table_query_CF').then(async (element: any) => {
      await element.forEach(entrada => {
        this.Entradas = [...this.Entradas, entrada]
      });
      this.updateSoma();
      this.viewport.scrollToIndex(9999)
    })
    this.loading = false

  }

  async clearAllFilters(){
    this.loading = true
    this.activeFilters = new ActiveFilters;
    console.log(this.activeFilters)
    this.Entradas = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'main_table_query_CF').then(async (element: any) => {
      await element.forEach(entrada => {
        this.Entradas = [...this.Entradas, entrada]
      });
      this.updateSoma();
    })
    this.loading = false

  }

  updateSoma(){

    let promise = new Promise(async (resolve, reject) => {

      //Total Receitas
      await this.server.get_List_CF({active_filters : this.activeFilters},'total_receitas').then((total: any) => {
        console.log(total)
        this.totalReceitas = total[0].TOTALR;
      }).catch(err => reject(err));

      //Total Despesas
      await this.server.get_List_CF({active_filters : this.activeFilters},'total_despesas').then((total: any) => {
        this.totalDespesas = total[0].TOTALD;
      }).catch(err => reject(err));

      //Total Investimentos
      await this.server.get_List_CF({active_filters : this.activeFilters},'total_investimentos').then((total: number) => {
        this.totalInvestimentos = total[0].TOTALI;
      }).catch(err => reject(err));

      if (this.totalInvestimentos === null) this.totalInvestimentos = 0;
      if (this.totalDespesas === null) this.totalDespesas = 0;
      if (this.totalReceitas === null) this.totalReceitas = 0;

      resolve()
    })

    return promise;
  }
}

