import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
//import { UppercaseDirective } from '../directives/uppercase.directive'

interface div_CC{
  Abreviacao: string;
  Descricao: string;
}

@Component({
  selector: 'app-novo.cc',
  templateUrl: './novo.cc.component.html',
  styleUrls: ['./novo.cc.component.scss']
})
export class NovoCCComponent implements OnInit {

  novoCCForm: FormGroup;
  divCCForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  divCCAray: Array<div_CC> = new Array();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.novoCCForm = this.formBuilder.group({
      Abreviacao: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern("^[A-Z]{3}$")
      ])),
      Descricao: new FormControl('', Validators.required),
    });

    this.divCCForm = this.formBuilder.group({
      Div_CC: new FormControl('',Validators.required),
      DescricaoDivCC: new FormControl('', Validators.required),
    });

  }

  addDivCC(){
    let json: div_CC = {
      Abreviacao: this.divCCForm.get('Div_CC').value,
      Descricao: this.divCCForm.get('DescricaoDivCC').value,
    }

    this.divCCAray = [...this.divCCAray,json];
    console.log(this.divCCAray);
  }

  onSubmit(){

  }

  onCancel(){

  }

}
