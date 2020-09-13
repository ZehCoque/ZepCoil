import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMatcherDirective } from './directives/error-matcher.directive'
import { CurrencyPipe } from '@angular/common';
import { ServerService } from './services/server.service'
import { Entrada } from './classes/entrada'

import * as moment from 'moment';

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
  changeDetection: ChangeDetectionStrategy.OnPush;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  newEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;

  today = moment().toISOString();

  Entradas: Array<Entrada> = new Array();

  CC:CC ={
    numero:[120, 150 ,22, 55],
    nomes:['Nome 1', 'Nome 2', 'Nome 3', 'Nome 4']
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
      Descricao: new FormControl('', Validators.required)
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      let valor = this.getNumberValue(val.Valor);
      if (val.Valor) {
        this.newEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

     this.server.get_List('main_table_query').then((response: any) => {

      response.forEach( (element:Entrada) => {

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

    let input_json: Entrada = {
      Descricao: this.newEntryForm.get("Descricao").value,
      Data_Entrada: moment(this.newEntryForm.get("Data_Entrada").value).toDate(),
      CC: this.newEntryForm.get("CC").value,
      Div_CC: this.newEntryForm.get("Div_CC").value,
      Vencimento: moment(this.newEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.newEntryForm.get("Valor").value),
      Observacao: this.newEntryForm.get("Observacao").value,
      Tipo: type,
      Destinatário: "Zep"
    }

    this.Entradas = [...this.Entradas, input_json]
    this.cdk_empty = false;

    this.server.add_List(input_json,'main_table_query').then(res => {

    });

  }

}
