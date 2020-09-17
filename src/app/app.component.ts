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

interface Nome_f{
  nomes: Array<string>;
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

  today = moment().toISOString();

  Entradas: Array<Entrada> = new Array();

  CC:CC ={
    numero:[120, 150 ,22, 55],
    nomes:['CJ', 'Uba']
  } ;

  Destinatarios:Nome_f ={
    nomes:['Dest1', 'Dest2', 'Dest3', 'Dest4']
  } ;
  cdk_empty: boolean = true;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService) { }

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
      Nome_f: new FormControl('')
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      if (val.Valor) {
        let valor = this.getNumberValue(val.Valor);
        this.newEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

     this.server.get_List('main_table_query').then((response: any) => {

      response.forEach( (element:Entrada) => {
        console.log(element)
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
      Nome_f: this.newEntryForm.get("Nome_f").value
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
  }

  onContextMenu(event: MouseEvent, item) {

    event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = { 'item': item };
      this.contextMenu.menu.focusFirstItem('mouse');
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

  editLine(){

  }

  deleteLine(){

  }

}
