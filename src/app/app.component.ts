import { Component, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  addNewform: FormGroup;

  list = Array(20);


  constructor(private formBuilder: FormBuilder) { }

  ngOnInit()  {
    let length = this.viewport.getDataLength()
    this.viewport.scrollToIndex(length);

    this.addNewform = this.formBuilder.group({
      partnumber: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]*$')
      ])),
      description: new FormControl('',Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]*$')
      ]))
    });

  }

  scroll_func(event){
    console.log(event)
  }

}
