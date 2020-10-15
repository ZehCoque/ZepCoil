import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UppercaseDirective } from '../directives/uppercase.directive'

@Component({
  selector: 'app-novo.cc',
  templateUrl: './novo.cc.component.html',
  styleUrls: ['./novo.cc.component.scss']
})
export class NovoCCComponent implements OnInit {

  newEntryForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.newEntryForm = this.formBuilder.group({
      Descricao: new FormControl('', Validators.required),

    });

  }

}
