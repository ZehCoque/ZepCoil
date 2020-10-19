import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Entrada } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';

interface CC {
  numero: Array<number>;
  nomes: Array<string>
}

interface Pessoa{
  nomes: Array<string>;
}

@Component({
  selector: 'app-edit-row',
  templateUrl: './edit-row.component.html',
  styleUrls: ['./edit-row.component.scss']
})
export class EditRowComponent implements OnInit {

  Entradas: Array<Entrada> = new Array();

  CC:CC ={
    numero:[120, 150 ,22, 55],
    nomes:['CJ', 'Uba']
  } ;

  Destinatarios:Pessoa ={
    nomes:['Dest1', 'Dest2', 'Dest3', 'Dest4']
  } ;

  editedEntryForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  today = moment().toISOString();

  constructor(private formBuilder: FormBuilder,
    private currencyPipe : CurrencyPipe,
    @Inject(MAT_DIALOG_DATA) public current_data: Entrada,
    public dialogRef: MatDialogRef<EditRowComponent>) { }

  ngOnInit()  {

    if (this.current_data.N_Invest === 0) {
      this.current_data.N_Invest = null;
    }

    this.editedEntryForm = this.formBuilder.group({
      Descricao: new FormControl(this.current_data.Descricao, Validators.required),
      Valor: new FormControl(this.currencyPipe.transform(this.current_data.Valor,'BRL','symbol','1.2-2'), Validators.required),
      Data_Entrada: new FormControl(this.current_data.Data_Entrada, Validators.required),
      CC: new FormControl(this.current_data.CC,Validators.required),
      Div_CC: new FormControl(Number(this.current_data.Div_CC),Validators.required),
      Vencimento: new FormControl(this.current_data.Vencimento, Validators.required),
      Observacao: new FormControl(this.current_data.Observacao),
      N_Invest: new FormControl(this.current_data.N_Invest, Validators.pattern("^[0-9]*$")),
      Responsavel: new FormControl(this.current_data.Responsavel,Validators.required),
      Tipo: new FormControl(this.current_data.Tipo,Validators.required),
      Pessoa: new FormControl(this.current_data.Pessoa)
    });

    this.selectType(this.current_data.Tipo);
    this.selectResp(this.current_data.Responsavel);

    this.editedEntryForm.valueChanges.subscribe(val => {
      if (val.Valor) {
        let valor = this.getNumberValue(val.Valor);
        this.editedEntryForm.patchValue({
          Valor: this.currencyPipe.transform(valor,'BRL','symbol','1.2-2') },
          {emitEvent:false})
      }
    });

  }

  selectType(type:number){
    this.editedEntryForm.controls.Tipo.setValue(type);
    if (type == 0){
      document.getElementsByName("addButton_edit")[0].style.opacity = "1";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("investButton_edit")[0].style.opacity = "0.4";
    }
    if (type == 1){
      document.getElementsByName("addButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "1";
      document.getElementsByName("investButton_edit")[0].style.opacity = "0.4";
    }
    if (type == 2){
      document.getElementsByName("addButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("removeButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("investButton_edit")[0].style.opacity = "1";
    }
  }

  selectResp(resp:String){
    this.editedEntryForm.controls.Responsavel.setValue(resp);
    if (resp == "Coil"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "1";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "0.4";
    }
    if (resp == "Zep"){
      document.getElementsByName("CButton_edit")[0].style.opacity = "0.4";
      document.getElementsByName("ZButton_edit")[0].style.opacity = "1";
    }
  }

  onSubmit(){

    let edited_json: Entrada = {
      Descricao: this.editedEntryForm.get("Descricao").value,
      Data_Entrada: moment(this.editedEntryForm.get("Data_Entrada").value).toDate(),
      CC: this.editedEntryForm.get("CC").value,
      Div_CC: this.editedEntryForm.get("Div_CC").value,
      Vencimento: moment(this.editedEntryForm.get("Vencimento").value).toDate(),
      Valor:  this.getNumberValue(this.editedEntryForm.get("Valor").value),
      Observacao: this.editedEntryForm.get("Observacao").value,
      Tipo: this.editedEntryForm.get("Tipo").value,
      Responsavel: this.editedEntryForm.get("Responsavel").value,
      N_Invest: Number(this.editedEntryForm.get("N_Invest").value),
      Pessoa: this.editedEntryForm.get("Pessoa").value
    }

    this.dialogRef.close(edited_json);

  }

  onClear(){
    this.editedEntryForm.reset();

    let reset_data = this.current_data;

    delete reset_data.ID;

    this.editedEntryForm.setValue(reset_data);
  }

  Cancel(){
    this.dialogRef.close();
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
