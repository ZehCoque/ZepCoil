import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Contratos } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-novo-contrato',
  templateUrl: './novo-contrato.component.html',
  styleUrls: ['./novo-contrato.component.scss']
})
export class NovoContratoComponent implements OnInit {

    novoContrato: Contratos;
    novoContratoForm: FormGroup;
    loading: Boolean = true;

    error: string;

    Tipos = ['Fixo','Variável'];

    errorMatcher: ErrorMatcherDirective;
    currencyPipe: any;

    today = moment().toISOString();

    constructor(private formBuilder: FormBuilder,
                private server: ServerService,
                public dialogRef: MatDialogRef<NovoContratoComponent>,
                @Inject(MAT_DIALOG_DATA) public preloaded) { }

    ngOnInit(): void {

      this.novoContratoForm = this.formBuilder.group({
        Descricao: new FormControl('', Validators.required),
        Pessoa: new FormControl('', Validators.required),
        Valor: new FormControl(this.currencyPipe.transform(0.00,'BRL','symbol','1.2-2'), Validators.required),
        Data_inicio: new FormControl(moment().toISOString(), Validators.required),
        CC: new FormControl('',Validators.required),
        Div_CC: new FormControl('',Validators.required),
        Data_termino: new FormControl(moment(this.today).add(1, 'M').toISOString(), Validators.required),
        Tipo: new FormControl('',Validators.required)
      });

      if (this.preloaded.contrato){
        this.novoContratoForm.patchValue(this.preloaded.contrato);

      }

      this.loading = false;

    }

    onSubmit(){
      this.error = '';
      if (this.preloaded.pessoa){
        this.delete_pessoa().then(() => {
          this.add_pessoa().then(() => {
            this.server.update_value({old: this.preloaded.pessoa.Nome, new: this.novoContratoForm.get('Nome').value}, )
            .then(() => this.onCancel('novoContrato'))
            .catch(error => console.log(error));

          })
        });
      } else {
        this.add_pessoa().then(() => {
          this.onCancel('novaPessoa');
        })
      }

    }

    add_contrato(){

      let promise = new Promise((resolve,reject) => {

        this.novoContrato = {

        }

        this.server.add_List(this.novoContrato,).then(() => {

          resolve();

        }).catch(error => {
          console.log(error);
          this.error = error;
        })
      })

        return promise;
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

  }

