import { Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ServerService } from '../services/server.service'
import { CC, div_CC, Contratos, Pessoa } from '../classes/tableColumns'

import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SortMessages } from '../classes/active_filters_and_sorts';
import { newDataTrackerService } from '../services/new-data-tracker.service';
import { ContratosActiveFilters, ContratosActiveSorts } from '../classes/active_filters_and_sorts contratos';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NovoContratoComponent } from '../novo-contrato/novo-contrato.component';

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

  Contratos: Array<Contratos>;
  filterValues: Array<string>;
  CC:Array<CC> = new Array();
  div_CC:Array<div_CC> = new Array<div_CC>();
  Pessoa:Array<Pessoa> = new Array();

  cdk_empty: boolean = true;

  activeSorts: ContratosActiveSorts = new ContratosActiveSorts;
  activeFilters: ContratosActiveFilters = new ContratosActiveFilters;
  sortMessages: SortMessages = new SortMessages;

  editRowDialogRef: MatDialogRef<NovoContratoComponent>;
  currentActiveSort: string;
  currentActiveFilter: string;
  contratos: any[];

  constructor(
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService
    ) { }

  ngOnInit()  {

    this.newDataEmitter.currentData.subscribe(() => {
      this.loading = true;
      this.loadData()
      .then(() => {
        this.loading = false;
        if (this.Contratos.length > 0) {
          this.cdk_empty = false;
        }
        setTimeout(() => {
          this.viewport.scrollToIndex(this.viewport.getDataLength());
        }, 0);
      })
      .catch((error) => console.log(error));
    })
  }




  loadData(){
        let promise = new Promise<void>(async (resolve, reject) => {
        this.CC = new Array();
        this.div_CC = new Array();
        this.Pessoa = new Array();

        this.Contratos = new Array();
        //GET ALL Contratos
        await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'contratos_query').then(async (response: any) => {
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

  getColumnValues(column:string) {
    this.filterValues = new Array<string>();
    let select_col_value = this.activeFilters[column];

    if (this.activeFilters[column].length > 0) this.activeFilters[column] = '';

    this.server.get_Value({column: column, active_filters: this.activeFilters},'contratos_query_column').then((element: any) => {
      element.forEach(el => {
        if (el[column] != null) this.filterValues = [...this.filterValues, el[column]]
      });

    });
    this.activeFilters[column] = select_col_value;
    return this.filterValues
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

    this.editRowDialogRef = this.dialog.open(NovoContratoComponent,{
      width: "50%",
      data: this.Contratos[row].Identificacao
    });

    this.editRowDialogRef.afterClosed().subscribe((results) => {
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
        this.server.delete_List(item,'contratos_query').then(() =>{
          if (this.Contratos.length == 0) this.cdk_empty = true;

        })
      }
    })

   }

   async filterBy(column: string, selected: string) {
    this.loading = true
    this.activeFilters[column] = String(selected);
    this.Contratos = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'contratos_query').then(async (element: any) => {
      await element.forEach(contratos => {
        this.Contratos = [...this.Contratos, contratos]
      });
    })
    this.loading = false

  }

  async clearFilter(column: string){
    this.loading = true
    this.activeFilters[column] = '';
    this.Contratos = [];
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'contratos_query').then(async (element: any) => {
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
    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'contratos_query').then(async (element: any) => {
      await element.forEach(contratos => {
        this.Contratos = [...this.Contratos, contratos]
      });

    })
    this.loading = false

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

    await this.server.get_List_CF({active_filters : this.activeFilters, active_sorts : this.activeSorts} , 'contratos_query').then(async (response: any) => {
      this.Contratos = [];
      await response.forEach( (element:Contratos) => {
        this.Contratos = [...this.Contratos, element];

      });

    });

    if (this.Contratos.length > 0) {
      this.cdk_empty = false;
    }

    this.loading = false;
  }

  openContratosDialog(){

    this.editRowDialogRef = this.dialog.open(NovoContratoComponent,{
      width: "70%"
    });

    this.editRowDialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
    });
  }
}
