import { Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ServerService } from '../services/server.service'
import { CC, div_CC, Contratos, Pessoa } from '../classes/tableColumns'

import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SortMessages } from '../classes/active_filters_and_sorts';
import { newDataTrackerService } from '../services/new-data-tracker.service';
import { ContratosActiveFilters, ContratosActiveSorts, FilterListsContratos } from '../classes/active_filters_and_sorts contratos';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NovoContratoComponent } from '../novo-contrato/novo-contrato.component';
import { PgmtContratosModalComponent } from '../pgmt-contratos-modal/pgmt-contratos-modal.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  @ViewChild('contextMenuTrigger') contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };
  changeDetection: ChangeDetectionStrategy.OnPush;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  loading: boolean = true;

  errorMatcher: ErrorMatcherDirective;

  filterLists: FilterListsContratos = new FilterListsContratos;

  Contratos: Array<Contratos>;
  filterValues: Array<string>;
  CC:Array<CC> = new Array();
  div_CC:Array<div_CC> = new Array<div_CC>();
  Pessoa:Array<Pessoa> = new Array();

  cdk_empty: boolean = true;

  activeSorts: ContratosActiveSorts = new ContratosActiveSorts;
  activeFilters: ContratosActiveFilters = new ContratosActiveFilters;
  sortMessages: SortMessages = new SortMessages;

  editRowDialogRefNovoContrato: MatDialogRef<NovoContratoComponent>;
  editRowDialogRefVisualizarContrato: MatDialogRef<PgmtContratosModalComponent>;
  currentActiveSort: string;
  currentActiveFilter: string;

  datasForm: FormGroup;
  valorForm: FormGroup;

  today = moment().startOf('day').toISOString();
  monthStart = moment().startOf('month').toISOString();
  monthEnd = moment().endOf('month').toISOString();

  lastMonthStart = moment().add(-1,'month').startOf('month').toISOString();
  lastMonthEnd = moment().add(-1,'month').endOf('month').toISOString();

  query_url: string = 'contratos_query';
  column_url: string = 'contratos_query_column';

  dateError: boolean = false;
  valueError: boolean = false;
  textFilters: FormControl;

  columnToFilter = ['Identificacao','Pessoa','Descricao','CC','Div_CC','Tipo'];

  filteredOptionsText: Observable<String[]>;

  constructor(
    private formBuilder: FormBuilder,
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService,
    private currencyPipe : CurrencyPipe,
    ) { }

  ngOnInit()  {

    this.newDataEmitter.currentData.subscribe(() => {
      this.loading = true;
      this.loadData()
      .then(() => {
        console.log(this.filterLists)
        this.loading = false;
        if (this.Contratos.length > 0) {
          this.cdk_empty = false;
        }
        setTimeout(() => {
          this.viewport.scrollToIndex(this.viewport.getDataLength());
        }, 0);
      })
      .catch((error) => console.log(error));
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

      this.valueError = Number(this.getNumberValue(this.valorForm.controls.Valor1.value)) >= Number(this.getNumberValue(this.valorForm.controls.Valor2.value));

    });

    this.valorForm.controls.Valor2.valueChanges.subscribe((val) => {

      this.valueError = Number(this.getNumberValue(this.valorForm.controls.Valor1.value)) >= Number(this.getNumberValue(this.valorForm.controls.Valor2.value));


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

        this.Contratos = new Array();

        this.filterLists = new FilterListsContratos;
        //GET ALL Contratos
        await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (response: any) => {
            await response.forEach( (element:Contratos) => {
              this.Contratos = [...this.Contratos, element];
            });
          }).catch(err => reject(err));

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
        await this.server.get_Value({column: column_name},this.column_url).then(async (response: any) => {
          await response.forEach((element) => {
            if (element[column_name] != null && element[column_name] != '') this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]];

          });
        }).catch(err => reject(err));
      })



          resolve();

        })
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


  onContextMenu(event: MouseEvent, item, index) {

    event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = { 'item': item, 'index': index };
      this.contextMenu.openMenu();

  }

  scroll_func(event){

  }

  editLine(row){

    this.editRowDialogRefNovoContrato = this.dialog.open(NovoContratoComponent,{
      width: "100%",
      data: this.Contratos[row].Identificacao
    });

    this.editRowDialogRefNovoContrato.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
    });
  }

  deleteLine(item, row){

    const confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Tem certeza que deseja deletar?"
    });

    confirmationDialog.afterClosed().subscribe(result => {
      if (result){
        this.Contratos = this.Contratos.filter((item, index) => index !== row)
        this.server.delete_List(item,this.query_url).then(() =>{
          if (this.Contratos.length == 0) this.cdk_empty = true;

        })
      }
    })

   }


  async clearFilter(column: string){
    this.loading = true
    this.activeFilters[column] = '';
    this.Contratos = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , this.query_url).then(async (element: any) => {
      await element.forEach(contratos => {
        this.Contratos = [...this.Contratos, contratos]
      });

      this.viewport.scrollToIndex(9999)
    })
    this.loading = false

  }

  async clearAllFilters(){
    this.loading = true
    this.activeFilters = new ContratosActiveFilters;
    this.Contratos = [];
    this.loadData().then(() => {
      this.loading = false
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());

      }, 0);

    })

  }

  openContratosDialog(){

    this.editRowDialogRefNovoContrato = this.dialog.open(NovoContratoComponent,{
      width: "100%"
    });

    this.editRowDialogRefNovoContrato.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
    });
  }

  viewContrato(IdentificacaoContrato){

    this.editRowDialogRefVisualizarContrato = this.dialog.open(PgmtContratosModalComponent,{
      width: "100%",
      data: IdentificacaoContrato
    });

    this.editRowDialogRefVisualizarContrato.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
    });
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
      this.Contratos = [];
      await response.forEach( (element:Contratos) => {
        this.Contratos = [...this.Contratos, element];

      });

    });

    if (this.Contratos.length > 0) {
      this.cdk_empty = false;
    }

    this.loading = false;
    setTimeout(() => {
      this.viewport.scrollToIndex(this.viewport.getDataLength());
    }, 0);

  }

  async filterBy(column: string, selected: string) {
    this.loading = true
    this.activeFilters[column] = String(selected);
    this.Contratos = [];

    this.applyFilter().then(() =>{
      this.loading = false;
      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
        this.clearFilterForms();
      }, 0);
    })


  }

  async filterBySpecial(column: string, type: string, diff?: String) {
    this.loading = true
    this.Contratos = [];

    this.activeFilters[column] = {
      equals: '',
      greater: '',
      smaller: '',
      greater_and_equalTo: '',
      smaller_and_equalTo: '',
    }

    let value1;
    let value2;

    if (column === "Data_inicio" || column === "Data_termino"){
      value1 = this.datasForm.controls.Data1.value;
      value2 = this.datasForm.controls.Data2.value;
      console.log(value1,value2)
    } else if (column === "Valor") {
      value1 = this.getNumberValue(this.valorForm.controls.Valor1.value);
      value2 = this.getNumberValue(this.valorForm.controls.Valor2.value);
    }

    if (type == 'between') {
      this.activeFilters[column].greater = value1;
      this.activeFilters[column].smaller = value2;
    } else {
      this.activeFilters[column][type] = value1;
    }

    console.log(this.activeFilters)

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
          this.Contratos = [...this.Contratos, entrada];
        });

        this.columnToFilter.forEach(async (column_name) => {
          this.filterLists[column_name] = new Array();

          if (this.activeFilters[column_name]) {
            await this.server.get_Value({column: column_name, active_sorts : this.activeSorts},this.column_url).then(async (response: any) => {

              await response.forEach((element) => {
                if (element[column_name] != null && element[column_name] != '') this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]];
              });
            }).catch(err => {
              console.log(err);
              reject();
            });
          } else {
            await this.server.get_Value({column: column_name, active_filters : this.activeFilters, active_sorts : this.activeSorts},this.column_url).then(async (response: any) => {

              await response.forEach((element) => {
                if (element[column_name] != null && element[column_name] != '') this.filterLists[column_name] = [...this.filterLists[column_name], element[column_name]];
              });
            }).catch(err => {
              console.log(err);
              reject();
            });
          }
        });

        if (this.Contratos.length > 0) {
          this.cdk_empty = false;
        } else {
          this.cdk_empty = true;
        }

        resolve();

      });


    })

    return promise;
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

}
