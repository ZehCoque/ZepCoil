import { Component, ViewChild } from '@angular/core';
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
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  newEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  today = moment().toISOString();
  nextMonth = moment(this.today).add(1, 'M')

  Entradas: Array<Entrada> = new Array();

  CC:CC ={
    numero:[100, 200 ,300],
    nomes:['Nome 1', 'Nome 2', 'Nome 3']
  } ;

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    private server: ServerService) { }

  ngOnInit()  {

    this.newEntryForm = this.formBuilder.group({
      valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
      data_entrada: new FormControl(moment().toISOString(), Validators.required),
      CC: new FormControl('',Validators.required),
      div_CC: new FormControl('',Validators.required),
      data_vencimento: new FormControl(moment(this.today).add(1, 'M'), Validators.required),
      observacao: new FormControl(''),
      nome_entrada: new FormControl('', Validators.required)
    });

    this.newEntryForm.valueChanges.subscribe(val => {
      let valor = val.valor
      valor = valor.replace(/\D/g,"");
      valor = [valor.slice(0, valor.length - 2), '.', valor.slice(valor.length - 2)].join('');
      if (valor.charAt(0) == '0'){
        valor = valor.slice(1);
      }
      if (val.valor) {
        this.newEntryForm.patchValue({
          valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

     this.server.get_List('main_table_query').then((response: any) => {

      response.forEach( (element:Entrada) => {

        this.Entradas.push(element);


      });

    });

    console.log(this.Entradas)

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

  }

}
