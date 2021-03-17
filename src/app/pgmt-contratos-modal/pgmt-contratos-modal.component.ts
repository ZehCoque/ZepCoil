import { CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AdminPessoasComponent } from '../admin-pessoas/admin-pessoas.component';
import { CalcTotal } from '../classes/calcTotal';
import { Checkbox, LanXCon, PagamentosContratos } from '../classes/tableColumns';
import { TipoTextPipe } from '../pipes/tipo-text.pipe';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-pgmt-contratos-modal',
  templateUrl: './pgmt-contratos-modal.component.html',
  styleUrls: ['./pgmt-contratos-modal.component.scss']
})
export class PgmtContratosModalComponent implements OnInit {

  novoContratoForm: FormGroup;
  contratosPgmtForm: FormGroup;

  pagamentosContratos: Array<PagamentosContratos> = new Array();

  IdentificacaoArray: Array<String> = new Array();

  filteredOptions: Observable<String[]>;
  error: any;

  lanxcon: Array<LanXCon> = new Array();

  allComplete: boolean = false;

  mainCheckBox: Checkbox = {
    completed: false,
    color: 'primary'
  }

  selectedDataPgto: Array<String> = new Array();

  totalBruto: number = 0;
  totalLiquido: number = 0;
  totalPiscina: number = 0;
  totalLancamentos: number = 0;


  constructor(private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private server: ServerService,
    public dialogRef: MatDialogRef<AdminPessoasComponent>,
    @Inject(MAT_DIALOG_DATA) public Identificacao: String,
    private tipoPipe: TipoTextPipe,
    private calcTotal: CalcTotal) { }

  ngOnInit(): void {
    this.novoContratoForm = this.formBuilder.group({
      Identificacao: new FormControl({value: '', disabled: true}),
      Descricao: new FormControl({value: '', disabled: true}),
      Pessoa: new FormControl({value: '', disabled: true}),
      Valor: new FormControl({value: '', disabled: true}),
      Data_inicio: new FormControl({value: '', disabled: true}),
      CC: new FormControl({value: '', disabled: true}),
      Div_CC: new FormControl({value: '', disabled: true}),
      Data_termino: new FormControl({value: '', disabled: true}),
      Tipo: new FormControl({value: '', disabled: true})
    });

    if (this.Identificacao.length){

      this.getData(this.Identificacao);

    } else {

      this.loadData().then(() => {

        this.novoContratoForm.controls.Identificacao.enable();
        this.initFilter();
      }).catch((error)=>{
        this.error = error;
        console.log(error);
      });
    }

  }

  getData(Identificacao: String) {

    this.pagamentosContratos = new Array;

    this.server.get_Value({Identificacao: Identificacao},'contratos_query_get').then(response => {
      this.novoContratoForm.patchValue(response[0]);
      this.novoContratoForm.controls.Valor.patchValue(this.currencyPipe.transform(response[0].Valor ,'BRL','symbol','1.2-2'))
      this.novoContratoForm.controls.Tipo.patchValue(this.tipoPipe.transform(response[0].Tipo))
    })

    this.server.get_Value({Identificacao: Identificacao},'pagamentos_contratos_query').then(async (response: Array<PagamentosContratos>) => {
      this.pagamentosContratos = new Array;
      await response.forEach(element => {
        element.checkbox = {
          completed: false,
          color: 'primary'
        }
        this.pagamentosContratos = [...this.pagamentosContratos, element]
      });

      this.calcTotal.calcTotal(this.pagamentosContratos).then((res) => {
        this.totalBruto = res[0];
        this.totalLiquido = res[1];
        this.totalPiscina = res[2];
      });

    })


  }

  onCancel(){
    this.dialogRef.close()
  }

  initFilter(){
    this.filteredOptions = this.novoContratoForm.controls.Identificacao.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  loadData(){
    let promise = new Promise<void>(async (resolve, reject) => {

    //GET ALL Contratos
    await this.server.get_List('identificacao_unique').then(async (response: any) => {

        await response.forEach( (element:any) => {
          this.IdentificacaoArray = [...this.IdentificacaoArray, element.Identificacao];
        });
      }).catch(err => reject(err));


      resolve();

    })
    return promise;
}

private _filter(value: String): Array<String> {
  const filterValue = value.toString().toLowerCase();
  return this.IdentificacaoArray.filter(option => option.toLowerCase().includes(filterValue));
}

onChoice(id: String){

  let json = {
    Identificacao: id,
    DataPgmtString: this.selectedDataPgto.toString()
  }

  this.server.get_List_CF(json,'lanxcon').then(async (response: any) => {
    this.lanxcon = new Array();
    await response.forEach(element => {
      this.lanxcon = [...this.lanxcon, element];
    });

    //HERE
    this.calcTotal.calcTotalLanXCon(this.lanxcon).then((res: number) => {
      this.totalLancamentos = res;
    });
  });
}

//Functions for checkbox control

updateAllComplete(pgmt, completed: boolean) {
  pgmt.checkbox.completed = completed;
  this.allComplete = pgmt && this.pagamentosContratos.every(t => t.checkbox.completed);

  this.selectedDataPgto = new Array();

  let items = this.pagamentosContratos.filter(t => t.checkbox.completed);
  if (items.length == 0) {
    this.lanxcon = new Array();
    return;
  }

  for (let index in items) {
    this.selectedDataPgto.push(moment(items[index].DataPgto).toISOString());
  }

  this.onChoice(pgmt.Identificacao);

}

someComplete(): boolean {
  if (!this.pagamentosContratos) {
    return false;
  }
  return this.pagamentosContratos.filter(t => t.checkbox.completed).length > 0 && !this.allComplete;
}

setAll(completed: boolean) {
  this.allComplete = completed;
  if (!this.pagamentosContratos) {
    return;
  }

  for (let index in this.pagamentosContratos){
    this.pagamentosContratos[index].checkbox.completed = completed;
  }

  this.selectedDataPgto = new Array();


  if (completed == false) {
    this.lanxcon = new Array();
    return;
  }

  for (let index in this.pagamentosContratos){
    this.selectedDataPgto.push(moment(this.pagamentosContratos[index].DataPgto).toISOString());
  }

  this.onChoice(this.novoContratoForm.controls.Identificacao.value);

}

}
