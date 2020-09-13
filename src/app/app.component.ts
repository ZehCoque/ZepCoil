import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMatcherDirective } from './directives/error-matcher.directive'
import { CurrencyPipe } from '@angular/common';
import { ServerService } from './services/server.service'
import { Entrada } from './classes/entrada'

import * as moment from 'moment';
import { MatMenuTrigger } from '@angular/material/menu';

interface CC {
  numero: Array<number>;
  nomes: Array<string>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // key:any;

//   @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
//     this.key = event.key

// }
  @ViewChild(MatMenuTrigger)

  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  changeDetection: ChangeDetectionStrategy.OnPush;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  newEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  max_id:number;

  today = moment().toISOString();

  Entradas: Array<Entrada> = new Array();

  CC:CC ={
    numero:[120, 150 ,22, 55],
    nomes:['Div 1', 'Div 2', 'Div 3', 'Div 4']
  } ;
  cdk_empty: boolean = true;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService) { }

  ngOnInit()  {

    this.newEntryForm = this.formBuilder.group({
      Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl(moment().toISOString(), Validators.required),
      CC: new FormControl('',Validators.required),
      Div_CC: new FormControl('',Validators.required),
      Vencimento: new FormControl(moment(this.today).add(1, 'M').toISOString(), Validators.required),
      Observacao: new FormControl(''),
      Nome: new FormControl('', Validators.required)
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      if (val.Valor) {
        let valor = this.getNumberValue(val.Valor);
        this.newEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

    this.server.get_List('max_id').then((response:any) => {

      this.max_id = response[0].max_id;
      if (this.max_id == undefined){
        this.max_id = 0;
      }
    })

     this.server.get_List('main_table_query').then((response: any) => {

      response.forEach( (element:Entrada) => {
        element.ID = element.ID.substr(element.ID.length - 4);
        this.Entradas = [...this.Entradas, element];
        this.cdk_empty = false;
      });

    });


  }

  getNumberValue(value){
    let numberValue = value.replace(/\D/g,"");
    numberValue = [numberValue.slice(0, numberValue.length - 2), '.', numberValue.slice(numberValue.length - 2)].join('');
    if (numberValue.charAt(0) == '0'){
      numberValue = numberValue.slice(1);
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

  onSubmit(type: number){

    let string_max_id;

    if (this.max_id < 10) {
      string_max_id = "000" + String(this.max_id);
    } else if (this.max_id < 100){
      string_max_id = "00" + String(this.max_id);
    } else if (this.max_id < 1000){
      string_max_id = "0" + String(this.max_id);
    } else if (this.max_id < 10000){
      string_max_id = String(this.max_id);
    }

    let input_json: Entrada = {
      ID: string_max_id,
      Nome: this.newEntryForm.get("Nome").value,
      Data_Entrada: moment(this.newEntryForm.get("Data_Entrada").value).toDate(),
      CC: this.newEntryForm.get("CC").value,
      Div_CC: this.newEntryForm.get("Div_CC").value,
      Vencimento: moment(this.newEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.newEntryForm.get("Valor").value),
      Observacao: this.newEntryForm.get("Observacao").value,
      Tipo: type
    }

    this.newEntryForm.reset();
    this.newEntryForm.controls.Valor.patchValue(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'));

    this.max_id ++;
    this.Entradas = [...this.Entradas, input_json]
    this.cdk_empty = false;
    if (this.Entradas.length > 1) this.viewport.scrollToIndex(this.Entradas.length + 1);

    this.server.add_List(input_json,'main_table_query').then(res => {

    });

  }

  onContextMenu(event: MouseEvent, item) {

    event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = { 'item': item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();

  }

  editLine(){

  }

  deleteLine(){

  }

}
