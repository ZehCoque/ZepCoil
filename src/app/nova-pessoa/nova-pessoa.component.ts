import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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

  error: string;

  Tipos = ['Funcionário','Fornecedor','Cliente'];

  errorMatcher: ErrorMatcherDirective;

  constructor(private formBuilder: FormBuilder,
              private server: ServerService,
              public dialogRef: MatDialogRef<NovaPessoaComponent>) { }

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

  }

  onSubmit(){

    this.error = '';

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

      this.dialogRef.close(this.novaPessoa.Nome);

    }).catch(error => {
      console.log(error);
      this.error = error;
    })
  }

  onCancel(){
    this.dialogRef.close();
  }

  setTipo(tipo:string){
    this.novaPessoaForm.controls.Tipo.setValue(tipo);
  }

}

