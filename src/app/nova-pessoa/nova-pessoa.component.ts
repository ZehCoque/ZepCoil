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

  Tipos = ['Funcionário','Fornecedor'];

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

