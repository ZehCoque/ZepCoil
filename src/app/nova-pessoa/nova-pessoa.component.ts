import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';
import { utilsBr } from 'js-brasil';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-nova-pessoa',
  templateUrl: './nova-pessoa.component.html',
  styleUrls: ['./nova-pessoa.component.scss']
})
export class NovaPessoaComponent implements OnInit {
  public MASKS = utilsBr.MASKS;
  novaPessoa: Pessoa;
  novaPessoaForm: FormGroup;
  loading: Boolean = true;

  selected_document: string = 'CPF';

  error: string;

  Tipos = ['Funcionário','Fornecedor','Cliente'];

  errorMatcher: ErrorMatcherDirective;

  constructor(private formBuilder: FormBuilder,
              private server: ServerService,
              public dialogRef: MatDialogRef<NovaPessoaComponent>,
              @Inject(MAT_DIALOG_DATA) public preloaded,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;

    this.novaPessoaForm = this.formBuilder.group({
      Nome: new FormControl('', Validators.required),
      Sobrenome: new FormControl('', Validators.required),
      CPF_CNPJ: new FormControl(''),
      Banco: new FormControl(''),
      Agencia: new FormControl('',Validators.pattern("^[0-9]*$")),
      Conta: new FormControl('',Validators.pattern("^[0-9]*$")),
      Tipo: new FormControl('', Validators.required),
    });

    if (this.preloaded.pessoa){
      this.novaPessoaForm.patchValue(this.preloaded.pessoa);

      if (this.preloaded.pessoa.CPF_CNPJ){
        if (this.preloaded.pessoa.CPF_CNPJ.toString().length > 11) this.selected_document = 'CNPJ'
      }

      if (this.novaPessoaForm.get('CPF_CNPJ').value == 0) this.novaPessoaForm.controls.CPF_CNPJ.setValue('');
      if (this.novaPessoaForm.get('Agencia').value == 0) this.novaPessoaForm.controls.Agencia.setValue('');
      if (this.novaPessoaForm.get('Conta').value == 0) this.novaPessoaForm.controls.Conta.setValue('');

    }

    this.loading = false;
    this.dialogRef.disableClose = false;

  }

  changeDocument(radio_select: string){
    this.novaPessoaForm.get('CPF_CNPJ').value == '';
    this.selected_document = radio_select;
  }

  onSubmit(){
    this.loading = true;
    this.dialogRef.disableClose = true;
    this.error = '';
    if (this.preloaded.pessoa){
      this.delete_pessoa().then(() => {
        this.add_pessoa().then(() => {
          this.server.update_value({old: this.preloaded.pessoa.Nome, new: this.novaPessoaForm.get('Nome').value}, 'main_table_query_update_Pessoa')
          .then(() => this.onCancel('novaPessoa'))
          .catch(error => console.log(error));

        })
      });
    } else {
      this.add_pessoa().then(() => {
        this.onCancel('novaPessoa');
      })
    }
    this.loading = false;
    this.dialogRef.disableClose = false;
  }

  add_pessoa(){

    let given_cpj_cnpj;
    let given_agencia;
    let given_conta;

    let promise = new Promise((resolve,reject) => {
      if (this.novaPessoaForm.get('CPF_CNPJ').value == '') {
        given_cpj_cnpj = 0;
      } else {
        given_cpj_cnpj = this.novaPessoaForm.controls.CPF_CNPJ.value;
      }

      if (this.novaPessoaForm.get('Agencia').value == '') {
        given_agencia = 0;
      } else {
        given_agencia = this.novaPessoaForm.controls.Agencia.value;
      }

      if (this.novaPessoaForm.get('Conta').value == '') {
        given_conta = 0;
      } else {
        given_conta = this.novaPessoaForm.controls.Conta.value;
      }

      this.novaPessoa = {
        Nome: this.novaPessoaForm.get('Nome').value,
        Sobrenome: this.novaPessoaForm.get('Sobrenome').value,
        CPF_CNPJ: this.getNumberValue(given_cpj_cnpj),
        Banco: this.novaPessoaForm.get('Banco').value,
        Agencia: given_agencia,
        Conta: given_conta,
        Tipo: this.novaPessoaForm.get('Tipo').value,
      }

      this.server.add_List(this.novaPessoa,'pessoa_query_add').then(() => {

        resolve();

      }).catch(error => {
        console.log(error);
        this.error = error;
      })
    })

    	return promise;
  }

  delete_pessoa(){

    this.dialogRef.disableClose = true;
    this.loading = true;
    let promise = new Promise((resolve,reject) => {
      this.server.delete_Value({Nome: this.preloaded.pessoa.Nome},'pessoa_query_delete').then(() => {
        resolve();
      }).catch(error => {
        console.log(error);
        reject(error);
      })
    })

    return promise;
  }

  onDelete(){
    const confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Tem certeza que deseja deletar?"
    });

    confirmationDialog.afterClosed().subscribe(result => {
      if (result){
    this.delete_pessoa().then(() => {
      this.onCancel('deleted');
    })
    }

  })
  }

  onCancel(data?){
    this.dialogRef.close(data);
  }

  setTipo(tipo:string){
    this.novaPessoaForm.controls.Tipo.setValue(tipo);
  }

  getNumberValue(value){
    if (value == null) return;
    if (typeof value == "number") return;
    else return value.replace(/\D/g,"");
  }

}

