import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
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
import { ActiveFilters, ActiveSorts, FilterLists, SortMessages} from '../classes/active_filters_and_sorts';
import { newDataTrackerService } from '../services/new-data-tracker.service';
import { NovoCCComponent } from '../novo.cc/novo.cc.component';
import { NovaPessoaComponent } from '../nova-pessoa/nova-pessoa.component';
import { NavigationEnd, Router } from '@angular/router';
import { AppRoutingService } from '../services/app-routing-service.service';
import { filter, map, startWith } from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { HistoricoDialogComponent } from '../historico-dialog/historico-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})
export class LancamentosComponent implements OnInit, OnDestroy {

  @ViewChild('contextMenuTrigger') contextMenu: MatMenuTrigger;

  columnToFilter = ['Descricao','CC','Div_CC','Tipo','N_Invest','Pessoa','Responsavel','Contrato','DataPgtoContrato'];

  contextMenuPosition = { x: '0px', y: '0px' };
  changeDetection: ChangeDetectionStrategy.OnPush;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  textFilters: FormControl;
  newEntryForm: FormGroup;

  errorMatcher: ErrorMatcherDirective;
  loading = true;
  today = moment().startOf('day').toISOString();

  Entradas: Array<Entrada> = new Array();
  filterValues: Array<string>;
  CC:Array<CC> = new Array();
  div_CC:Array<div_CC> = new Array<div_CC>();
  Pessoa:Array<Pessoa> = new Array();

  cdk_empty: boolean = true;

  activeSorts: ActiveSorts = new ActiveSorts;
  activeFilters: ActiveFilters = new ActiveFilters;
  sortMessages: SortMessages = new SortMessages;

  Contratos: Array<String> = new Array();
  DataPgtoContrato: Array<String> = new Array();

  filteredOptions_Contratos: Observable<String[]>;

  filterLists: FilterLists = new FilterLists;

  editRowDialogRef: MatDialogRef<EditRowComponent>;
  currentActiveSort: string;
  currentActiveFilter: string;
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  totalInvestimentos: number = 0;
  state: any;
  routerEvents: any;

  query_url: string;
  column_url: string;

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
      value: 'A'
    },
  ];
  filteredOptionsText: Observable<String[]>;
  datasForm: FormGroup;
  dateError: boolean = false;
  valorForm: FormGroup;
  valueError: boolean = false;


  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService,
    private router: Router,
    private routingService: AppRoutingService) { }

  ngOnDestroy(): void {
    this.routerEvents.unsubscribe();
  }

  setState(){
    this.state = this.routingService.getRouteTitle();

    if (this.state === 1){
      this.query_url = 'lancamentos_query'
      this.column_url = 'lancamentos_query_column'
    } else {
      this.query_url = 'terceiros_query'
      this.column_url = 'terceiros_query_column'
    }
  }

  ngOnInit()  {

    this.setState();

    // LINE FOR TESTING

    this.filterLists.Tipo = [0,1,2];

    // END

    this.routerEvents = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {

      this.setState();

    });

    this.newEntryForm = this.formBuilder.group({
      Descricao: new FormControl('', Validators.required),
      Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl(moment().toISOString(), Validators.required),
      CC: new FormControl('',Validators.required),
      Div_CC: new FormControl({value: '', disabled: true},Validators.required),
      Vencimento: new FormControl(moment().toISOString(), Validators.required),
      Observacao: new FormControl('',Validators.maxLength(200)),
      N_Invest: new FormControl('', Validators.pattern("^[0-9]*$")),
      Responsavel: new FormControl('',Validators.required),
      Tipo: new FormControl(-1,Validators.required),
      Pessoa: new FormControl(''),
      Imposto: new FormControl(this.Imposto[0]),
      Tipo_despesa: new FormControl(this.Tipo_despesa[0]),
      Contrato: new FormControl(''),
      DataPgtoContrato: new FormControl({value: '', disabled: true}),
    });

    this.datasForm = this.formBuilder.group({
      Data1: new FormControl(moment().toISOString(), Validators.required),
      Data2: new FormControl(moment().add(1,'day').toISOString()),
    });

    this.valorForm = this.formBuilder.group({
      Valor1: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Valor2: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'))
    });

    this.textFilters = new FormControl('',Validators.required);

    this.valorForm.controls.Valor1.valueChanges.subscribe((val) => {

      if (val) {
        let valor = this.getNumberValue(val);

        this.valorForm.patchValue({
          Valor1: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }

      if (this.valorForm.controls.Valor1.value == this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2')) {
        this.valorForm.controls.Valor2.setValidators([]);
        this.valorForm.controls.Valor2.updateValueAndValidity();
        this.valorForm.controls.Valor2.setValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'))
      } else {
        this.valorForm.controls.Valor2.setValidators([Validators.required]);
        this.valorForm.controls.Valor2.updateValueAndValidity();
      }

      this.valueError = this.getNumberValue(this.valorForm.controls.Valor1.value) >= this.getNumberValue(this.valorForm.controls.Valor2.value);

    });

    this.valorForm.controls.Valor2.valueChanges.subscribe((val) => {

      this.valueError = this.getNumberValue(this.valorForm.controls.Valor1.value) >= this.getNumberValue(this.valorForm.controls.Valor2.value);

      if (val) {
        let valor = this.getNumberValue(val);
        this.valorForm.patchValue({
          Valor2: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

    this.datasForm.controls.Data1.valueChanges.subscribe(() => {
      if (this.datasForm.controls.Data1.value == '') {
        this.datasForm.controls.Data2.setValidators([]);
        this.datasForm.controls.Data2.updateValueAndValidity();
        this.datasForm.controls.Data2.setValue('')
      } else {
        this.datasForm.controls.Data2.setValidators([Validators.required]);
        this.datasForm.controls.Data2.updateValueAndValidity();
      }

      this.dateError = moment(this.datasForm.controls.Data1.value).toDate() >= moment(this.datasForm.controls.Data2.value).toDate();

    });

    this.datasForm.controls.Data2.valueChanges.subscribe(() => {
      this.dateError = moment(this.datasForm.controls.Data1.value).toDate() >= moment(this.datasForm.controls.Data2.value).toDate();
    });

    this.newEntryForm.controls.Contrato.valueChanges.subscribe(() => {
      if (this.newEntryForm.controls.Contrato.value == '') {
        this.newEntryForm.controls.DataPgtoContrato.setValidators([]);
        this.newEntryForm.controls.DataPgtoContrato.updateValueAndValidity();
        this.newEntryForm.controls.DataPgtoContrato.setValue('')
      } else {
        this.newEntryForm.controls.DataPgtoContrato.setValidators([Validators.required]);
        this.newEntryForm.controls.DataPgtoContrato.updateValueAndValidity();
      }
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      if (val.Valor) {
        let valor = this.getNumberValue(val.Valor);
        this.newEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

    this.newDataEmitter.currentData.subscribe(() => {

      this.loading = true;
      this.loadData()
      .then(() => {
        this.loading = false;
        if (this.Entradas.length > 0) {
          this.cdk_empty = false;
        }
        setTimeout(() => {
          this.viewport.scrollToIndex(this.viewport.getDataLength());

        }, 0);
      })
      .catch((error) => console.log(error));


    });
  }

  initFilter_Contratos(column_name){
    this.filteredOptions_Contratos = this.newEntryForm.controls.Contrato.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value,column_name))
    );
  }

  initFilter_Text(column_name){
    this.filteredOptionsText = this.textFilters.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value,column_name))
    );
  }

  private _filter(value: String, column_name): Array<String> {
    const filterValue = value.toString().toLowerCase();
    return this.filterLists[column_name].filter(option => option.toString().toLowerCase().includes(filterValue));
  }



  loadData(){
    let promise = new Promise<void>(async (resolve, reject) => {
    this.CC = new Array();
    this.div_CC = new Array();
    this.Pessoa = new Array();
    this.Entradas = new Array();
    this.filterLists = new FilterLists;

    //GET ALL ENTRADAS
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (element: any) => {
      await element.forEach(entrada => {
        this.Entradas = [...this.Entradas, entrada];
      })
    });

      //GET ALL CC
      await this.server.get_List('cc_query').then(async (response: any) => {
        await response.forEach( (CC:CC) => {
          this.CC = [...this.CC, CC];
        });
      }).catch(err => reject(err));

      //GET ALL PESSOAS
      await this.server.get_List('pessoa_query').then(async (response: any) => {
        await response.forEach( (Pessoa:Pessoa) => {
          this.Pessoa = [...this.Pessoa, Pessoa];
        });
      }).catch(err => reject(err));

      //GET ALL FILTER ARRAYS
      this.columnToFilter.forEach(async (column_name) => {
        this.filterLists[column_name] = new Array();
        await this.server.get_List_CF({column_name: column_name},'get_distinct_lancamentos').then(async (response: any) => {
          await response.forEach((element) => {
            if (element[column_name] != null && element[column_name] != '')this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]]
          });
        }).catch(err => reject(err));
      })

      await this.updateSoma()

      resolve();

    });



    return promise;
  }

  async get_DataPgtoContrato(id){
    this.DataPgtoContrato = new Array();
    await this.server.get_Value({Identificacao: id},'pagamentos_contratos_query').then((response:any) => {
      response.forEach(element => {
        this.DataPgtoContrato = [...this.DataPgtoContrato, element.DataPgto];
      });
    })
    if (this.DataPgtoContrato.length > 0) this.newEntryForm.controls.DataPgtoContrato.enable();
    else this.newEntryForm.controls.DataPgtoContrato.disable();
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
      this.newEntryForm.controls.Div_CC.disable();
      reject(err);
    });
    })

    promise.then((div_cc_len) => {
      if (div_cc_len > 0){
        this.newEntryForm.controls.Div_CC.enable();
      } else {
        this.newEntryForm.controls.Div_CC.disable();;
      }
    }).catch(() => this.newEntryForm.controls.Div_CC.disable())

    return promise;
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

  resetValue(){
    this.newEntryForm.controls.valor.setValue(
      "",
      {emitEvent: false}
    );
  }

  onSubmit(){

    this.server.get_List('max_id').then((results) => {
      let current_id = results[0].max_id + 1

      if (this.newEntryForm.get("Pessoa").value == null) {
        this.newEntryForm.controls.Pessoa.setValue(new Array(Entrada));
      }

      let imp = this.Imposto[0].value;

      if (this.newEntryForm.get("Tipo").value == 0){
        imp = this.newEntryForm.controls.Imposto.value.value;
      }

      let desp = this.Tipo_despesa[1].value;

      if (this.newEntryForm.get("Tipo").value == 1){
        desp = this.newEntryForm.get("Tipo_despesa").value.value;
      }

      if (this.newEntryForm.get("Contrato").value == '') this.newEntryForm.get("Contrato").setValue(null);
      if (this.newEntryForm.get("DataPgtoContrato").value == '') this.newEntryForm.get("DataPgtoContrato").setValue(null);

      let input_json: Entrada = {
        ID: current_id,
        Descricao: this.newEntryForm.get("Descricao").value,
        Data_Entrada: moment(this.newEntryForm.get("Data_Entrada").value).startOf('day').toISOString(),
        CC: this.newEntryForm.get("CC").value.Nome,
        Div_CC: this.newEntryForm.get("Div_CC").value.Divisao,
        Vencimento: moment(this.newEntryForm.get("Vencimento").value).startOf('day').toISOString(),
        Valor:  this.getNumberValue(this.newEntryForm.get("Valor").value),
        Observacao: this.newEntryForm.get("Observacao").value,
        Tipo: this.newEntryForm.get("Tipo").value,
        Responsavel: this.newEntryForm.get("Responsavel").value,
        N_Invest: this.newEntryForm.get("N_Invest").value,
        Pessoa: this.newEntryForm.get("Pessoa").value.Nome,
        Concluido: false,
        Imposto: imp,
        Tipo_despesa: desp,
        Contrato: this.newEntryForm.get("Contrato").value,
        DataPgtoContrato: this.newEntryForm.get("DataPgtoContrato").value
      }

      this.Entradas = [...this.Entradas, input_json]
      this.cdk_empty = false;
      if (this.Entradas.length > 1) {
        setTimeout(() => {
          this.viewport.scrollToIndex(this.viewport.getDataLength());
        }, 0);
      }

      this.server.add_List(input_json,'main_table_query').then(() => {
        this.onClear();
        this.updateSoma();
      });

    })

  }

  onClear(){

    this.newEntryForm.controls.Div_CC.disable();
    this.newEntryForm.reset();
    this.newEntryForm.controls.Descricao.setErrors(null);
    this.newEntryForm.controls.CC.setErrors(null);
    this.newEntryForm.controls.Div_CC.setErrors(null);
    this.newEntryForm.controls.Descricao.setErrors(null);
    this.newEntryForm.controls.Valor.patchValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));
    this.newEntryForm.controls.Data_Entrada.patchValue(moment().toISOString());
    this.newEntryForm.controls.Vencimento.patchValue(moment().toISOString());
    this.newEntryForm.controls.Imposto.patchValue(this.Imposto[0]);
    this.newEntryForm.controls.Tipo_despesa.patchValue(this.Tipo_despesa[0]);
    this.newEntryForm.controls.Tipo.patchValue(-1);

    if (document.getElementsByName("addButton")[0]) {
      document.getElementsByName("addButton")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton")[0].style.opacity = "0.4";
      document.getElementsByName("investButton")[0].style.opacity = "0.4";
    }

    if (document.getElementsByName("outButton")[0]){
      document.getElementsByName("outButton")[0].style.opacity = "0.4";
      document.getElementsByName("inButton")[0].style.opacity = "0.4";
    }
    document.getElementsByName("CButton")[0].style.opacity = "0.4";
    document.getElementsByName("ZButton")[0].style.opacity = "0.4";

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
    if (type == 4){
      document.getElementsByName("inButton")[0].style.opacity = "0.4";
      document.getElementsByName("outButton")[0].style.opacity = "1";
    }
    if (type == 3){
      document.getElementsByName("inButton")[0].style.opacity = "1";
      document.getElementsByName("outButton")[0].style.opacity = "0.4";
    }
  }

  selectResp(resp:string){
    this.newEntryForm.controls.Responsavel.setValue(resp);
    if (resp == "Coil"){
      document.getElementsByName("CButton")[0].style.opacity = "1";
      document.getElementsByName("ZButton")[0].style.opacity = "0.4";
      document.getElementsByName("MButton")[0].style.opacity = "0.4";
    }
    if (resp == "Zep"){
      document.getElementsByName("CButton")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton")[0].style.opacity = "1";
      document.getElementsByName("MButton")[0].style.opacity = "0.4";

    }
    if (resp == "MZ"){
      document.getElementsByName("MButton")[0].style.opacity = "1";
      document.getElementsByName("CButton")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton")[0].style.opacity = "0.4";
    }
  }

  editLine(row){

    this.editRowDialogRef = this.dialog.open(EditRowComponent,{
      width: "50%",
      data: this.Entradas[row].ID
    });

    this.editRowDialogRef.afterClosed().subscribe((results) => {
      if (results) this.updateSoma();
      this.newDataEmitter.newDataEmit(results);
    });
  }

  openHistoryDialog(row){
    this.dialog.open(HistoricoDialogComponent,{
      width: "50%",
      data: this.Entradas[row].ID
    });

  }

  deleteLine(item, row){

    const confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Tem certeza que deseja deletar?"
    });

    confirmationDialog.afterClosed().subscribe(result => {
      if (result){
        this.Entradas = this.Entradas.filter((item, index) => index !== row)
        this.server.delete_List(item,'main_table_query').then(() =>{
          if (this.Entradas.length == 0) this.cdk_empty = true;
          this.updateSoma();
        })
      }
    })

   }

   moveCursorToEnd(el) {
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

    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (response: any) => {
      this.Entradas = [];
      await response.forEach( (element:Entrada) => {
        this.Entradas = [...this.Entradas, element];

      });

    });

    if (this.Entradas.length > 0) {
      this.cdk_empty = false;
    }

    this.loading = false;
    setTimeout(() => {
      this.viewport.scrollToIndex(this.viewport.getDataLength());
    }, 0);

  }

  clearFilterForms(){
    this.datasForm.controls.Data1.patchValue(moment().toISOString());
    this.datasForm.controls.Data2.patchValue(moment().add(1,'day').toISOString());
    this.datasForm.markAsPristine();
    this.datasForm.updateValueAndValidity;

    this.valorForm.controls.Valor1.patchValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));
    this.valorForm.controls.Valor2.patchValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));
    this.valorForm.markAsPristine();
    this.valorForm.updateValueAndValidity;

    this.dateError = false;
    this.valueError = false;
  }

  async filterBy(column: string, selected: string) {
    this.loading = true
    this.activeFilters[column] = String(selected);
    this.Entradas = [];

    this.applyFilter().then(() =>{
      this.loading = false;
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
        this.clearFilterForms();
      }, 0);
    })


  }

  async filterBySpecial(column: string, type: string) {
    this.loading = true
    this.Entradas = [];

    this.activeFilters[column] = {
      equals: '',
      greater: '',
      smaller: '',
      greater_and_equalTo: '',
      smaller_and_equalTo: '',
    }

    let value1;
    let value2;

    if (column === "Data_Entrada" || column === "Vencimento"){
      value1 = this.datasForm.controls.Data1.value;
      value2 = this.datasForm.controls.Data2.value;
    } else if (column === "Valor") {
      value1 = this.getNumberValue(this.valorForm.controls.Valor1.value);
      value2 = this.getNumberValue(this.valorForm.controls.Valor2.value);
    }

    if (type == 'between') {
      this.activeFilters[column].greater_and_equalTo = value1;
      this.activeFilters[column].smaller_and_equalTo = value2;
    } else {
      this.activeFilters[column][type] = value1;
    }

    this.applyFilter().then(() =>{
      this.loading = false;
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
        this.clearFilterForms();
      }, 0);

    })

  }

  applyFilter(): Promise<void> {

    let promise = new Promise<void>(async (resolve,reject) => {

      await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (element: any) => {
        await element.forEach(entrada => {
          this.Entradas = [...this.Entradas, entrada];
        });
        this.updateSoma();

        this.columnToFilter.forEach(async (column_name) => {
          this.filterLists[column_name] = new Array();

          if (this.activeFilters[column_name]) {
            await this.server.get_Value({column: column_name, active_sorts : this.activeSorts},this.column_url).then(async (response: any) => {

              await response.forEach((element) => {
                if (element[column_name] != null && element[column_name] != '') this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]]
              });
            }).catch(err => {
              console.log(err);
              reject();
            });
          } else {
            await this.server.get_Value({column: column_name, active_filters : this.activeFilters, active_sorts : this.activeSorts},this.column_url).then(async (response: any) => {

              await response.forEach((element) => {
                if (element[column_name] != null && element[column_name] != '') this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]]
              });
            }).catch(err => {
              console.log(err);
              reject();
            });
          }
        });

        if (this.Entradas.length > 0) {
          this.cdk_empty = false;
        } else {
          this.cdk_empty = true;
        }

        resolve();

      });


    })

    return promise;
  }


  async clearFilter(column: string){
    this.loading = true

    if (column === "Data_Entrada" || column === "Vencimento" || column === "Valor"){

      delete this.activeFilters[column];

    } else {
      this.activeFilters[column] = '';
    }

    this.Entradas = [];

    this.applyFilter().then(() =>{
      this.loading = false;
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
        this.clearFilterForms();
      }, 0);

    })

  }

  async clearAllFilters(){
    this.loading = true
    this.activeFilters = new ActiveFilters;
    this.activeSorts = new ActiveSorts;
    this.clearFilterForms();

    this.Entradas = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (element: any) => {
      await element.forEach(entrada => {
        this.Entradas = [...this.Entradas, entrada]
      });
      this.loading = false
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());

      }, 0);
      this.updateSoma();
    })

    this.columnToFilter.forEach(async (column_name) => {
      this.filterLists[column_name] = new Array();
      await this.server.get_List_CF({column_name: column_name},'get_distinct_lancamentos').then(async (response: any) => {
        await response.forEach((element) => {
          if (element[column_name] != null && element[column_name] != '')this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]]
        });
      }).catch(err => console.log(err));
    })



  }

  updateSoma(){
    if (this.state === 2 ) return;
    let promise = new Promise<void>(async (resolve, reject) => {

      //Total Receitas
      await this.server.get_List_CF({active_filters : this.activeFilters, state: this.state},'total_receitas').then((total: any) => {
        this.totalReceitas = total[0].TOTALR;
      }).catch(err => reject(err));

      //Total Despesas
      await this.server.get_List_CF({active_filters : this.activeFilters, state: this.state},'total_despesas').then((total: any) => {
        this.totalDespesas = total[0].TOTALD;
      }).catch(err => reject(err));

      //Total Investimentos
      await this.server.get_List_CF({active_filters : this.activeFilters, state: this.state},'total_investimentos').then((total: number) => {
        this.totalInvestimentos = total[0].TOTALI;
      }).catch(err => reject(err));

      if (this.totalInvestimentos === null) this.totalInvestimentos = 0;
      if (this.totalDespesas === null) this.totalDespesas = 0;
      if (this.totalReceitas === null) this.totalReceitas = 0;

      if (this.Entradas.length > 0) {
        this.cdk_empty = false;
      } else {
        this.cdk_empty = true;
      }

      resolve();
    })

    return promise;
  }

  openCCDialog(): void {
    const dialogRef = this.dialog.open(NovoCCComponent, {
      width: '500px',
      data: {}
    });

    let sub = dialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
      sub.unsubscribe();
    });
  }

  openPessoaDialog(): void {
    const dialogRef = this.dialog.open(NovaPessoaComponent, {
      width: '1000px',
      data: {}
    });

    let sub = dialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
      sub.unsubscribe();
    });
  }

}

