import { Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive'
import { CurrencyPipe } from '@angular/common';
import { ServerService } from '../services/server.service'
import { Entrada } from '../classes/entrada'

import * as moment from 'moment';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditRowComponent } from '../edit-row/edit-row.component';
import { ActiveFilters, ActiveSorts, SortMessages } from '../classes/active_filters_and_sorts';
import { isEmpty } from 'rxjs/operators';


interface CC {
  numero: Array<number>;
  nomes: Array<string>
}

interface Pessoa{
  nomes: Array<string>;
}

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})
export class LancamentosComponent implements OnInit {

  // key:any;

//   @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
//     this.key = event.key

// }
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

  CC:CC ={
    numero:[120, 150 ,22, 55],
    nomes:['CJ', 'Uba']
  } ;

  Destinatarios:Pessoa ={
    nomes:['Dest1', 'Dest2', 'Dest3', 'Dest4']
  } ;
  cdk_empty: boolean = true;

  activeSorts: ActiveSorts = new ActiveSorts;
  activeFilters: ActiveFilters = new ActiveFilters;
  sortMessages: SortMessages = new SortMessages;

  editRowDialogRef: MatDialogRef<EditRowComponent>;
  currentActiveSort: string;
  currentActiveFilter: string;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService,
    private dialog: MatDialog) { }

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

     this.server.get_List('main_table_query').then(async (response: any) => {
    // << TESTAR LOADING COM SETTIMEOUT >>
      await response.forEach( (element:Entrada) => {
        //console.log(element)
        this.Entradas = [...this.Entradas, element];
        this.cdk_empty = false;
      });

      this.loading = false;

    });




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
      CC: this.newEntryForm.get("CC").value,
      Div_CC: this.newEntryForm.get("Div_CC").value,
      Vencimento: moment(this.newEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.newEntryForm.get("Valor").value),
      Observacao: this.newEntryForm.get("Observacao").value,
      Tipo: this.newEntryForm.get("Tipo").value,
      Responsavel: this.newEntryForm.get("Responsavel").value,
      N_Invest: Number(this.newEntryForm.get("N_Invest").value),
      Pessoa: this.newEntryForm.get("Pessoa").value
    }

    this.onClear();

    this.Entradas = [...this.Entradas, input_json]
    this.cdk_empty = false;
    if (this.Entradas.length > 1) this.viewport.scrollToIndex(this.Entradas.length + 1);

    this.server.add_List(input_json,'main_table_query').then(res => {

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

          sub.unsubscribe();
        });
      }
    });
  }

  deleteLine(item, row){
    this.Entradas = this.Entradas.filter((item, index) => index !== row)
    this.server.delete_List(item,'main_table_query').then(() =>{
      if (this.Entradas.length == 0) this.cdk_empty = true;
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

  sortBy(column: string, sort_dir: string){

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

    this.server.get_List_CF('main_table_query_SF',this.activeFilters,column,sort_dir).then((response: any) => {
      this.Entradas = [];
      response.forEach( (element:Entrada) => {
        this.Entradas = [...this.Entradas, element];
        this.cdk_empty = false;
      });

    });
  }

  filterBy(column: string, selected) {

    this.activeFilters[column] = selected;

    

  }

}

