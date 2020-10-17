import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';
//import { UppercaseDirective } from '../directives/uppercase.directive'

interface div_CC{
  Divisao: string
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
  divCCArray: Array<div_CC> = new Array();
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  error_CC: string;
  error_div_CC: string;

  constructor(private formBuilder: FormBuilder,
              private server: ServerService,
              public dialogRef: MatDialogRef<NovoCCComponent>) { }

  ngOnInit(): void {

    this.novoCCForm = this.formBuilder.group({
      Abreviacao: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern("^[A-Z1-9]{3}$")
      ])),
      Descricao: new FormControl('', Validators.required),
    });

    this.divCCForm = this.formBuilder.group({
      Div_CC: new FormControl('',Validators.required),
    });

  }

  addDivCC(){
    let json: div_CC = {
      Divisao: this.divCCForm.get('Div_CC').value
    }

    this.divCCForm.reset();
    this.divCCForm.untouched;

    let hasDuplicate = [...this.divCCArray,json].some((val, i) => [...this.divCCArray,json].indexOf(val) !== i);
    console.log([...this.divCCArray,json])
    if (!hasDuplicate){
      this.divCCArray = [...this.divCCArray,json];

      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
      }, 0);
    } else {

      this.error_div_CC = 'Conflict';

    }

  }

  removeDivCC(id:number){
    this.divCCArray = this.divCCArray.filter((item, index) => index !== id);

  }

  onSubmit(){

    this.error_CC = '';
    this.error_div_CC = '';

    let CC = {
      Nome: this.novoCCForm.get('Abreviacao').value,
      Descricao: this.novoCCForm.get('Descricao').value
    }

    this.server.add_List(CC,'cc_query_add').then(async() => {

      await this.divCCArray.forEach(async element => {
        console.log(element)
        await this.server.add_List({Nome: CC.Nome, Divisao: element.Divisao},'div_cc_query_add')
        .catch(error => {
          console.log(error);
          this.error_div_CC = error;
        });
      });

      this.dialogRef.close();

    }).catch(error => {
      console.log(error);
      this.error_CC = error;
    })
  }

  onCancel(){
    this.dialogRef.close();
  }

}
