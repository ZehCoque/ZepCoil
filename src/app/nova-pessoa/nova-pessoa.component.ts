import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pessoa } from '../classes/tableColumns';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-nova-pessoa',
  templateUrl: './nova-pessoa.component.html',
  styleUrls: ['./nova-pessoa.component.scss']
})
export class NovaPessoaComponent implements OnInit {

  novaPessoa: Pessoa;
  novaPessoaForm: FormGroup;
  loading: Boolean = true;

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  error: string;

  Tipos = ['Funcionário','Fornecedor','Cliente'];

  errorMatcher: ErrorMatcherDirective;

  constructor(private formBuilder: FormBuilder,
              private server: ServerService,
              public dialogRef: MatDialogRef<NovaPessoaComponent>,
              @Inject(MAT_DIALOG_DATA) public preloaded) { }

  ngOnInit(): void {

    this.novaPessoaForm = this.formBuilder.group({
      Nome: new FormControl('', Validators.required),
      Sobrenome: new FormControl('', Validators.required),
      CPF_CNPJ: new FormControl('', Validators.pattern("^[0-9]*$")),
      Banco: new FormControl(''),
      Agencia: new FormControl('',Validators.pattern("^[0-9]*$")),
      Conta: new FormControl('',Validators.pattern("^[0-9]*$")),
      Tipo: new FormControl('', Validators.required),
    });

    if (this.preloaded.pessoa){
      this.novaPessoaForm.patchValue(this.preloaded.pessoa);

      if (this.novaPessoaForm.get('CPF_CNPJ').value == 0) this.novaPessoaForm.controls.CPF_CNPJ.setValue('');
      if (this.novaPessoaForm.get('Agencia').value == 0) this.novaPessoaForm.controls.Agencia.setValue('');
      if (this.novaPessoaForm.get('Conta').value == 0) this.novaPessoaForm.controls.Conta.setValue('');

      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
      }, 0);

    }

    this.loading = false;

  }

  onSubmit(){
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

  }

  add_pessoa(){
    
    let promise = new Promise((resolve,reject) => {
      if (this.novaPessoaForm.get('CPF_CNPJ').value == '') this.novaPessoaForm.controls.CPF_CNPJ.setValue(0);
      if (this.novaPessoaForm.get('Agencia').value == '') this.novaPessoaForm.controls.Agencia.setValue(0);
      if (this.novaPessoaForm.get('Conta').value == '') this.novaPessoaForm.controls.Conta.setValue(0);

      this.novaPessoa = {
        Nome: this.novaPessoaForm.get('Nome').value,
        Sobrenome: this.novaPessoaForm.get('Sobrenome').value,
        CPF_CNPJ: this.novaPessoaForm.get('CPF_CNPJ').value,
        Banco: this.novaPessoaForm.get('Banco').value,
        Agencia: this.novaPessoaForm.get('Agencia').value,
        Conta: this.novaPessoaForm.get('Conta').value,
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
    this.delete_pessoa().then(() => {
      this.onCancel('deleted');
    })
  }

  onCancel(data?){
    this.dialogRef.close(data);
  }

  setTipo(tipo:string){
    this.novaPessoaForm.controls.Tipo.setValue(tipo);
  }

}

