import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { LanXCon } from '../classes/tableColumns';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-lanxcon',
  templateUrl: './lanxcon.component.html',
  styleUrls: ['./lanxcon.component.scss']
})
export class LanxconComponent implements OnInit {

  Identificacao: Array<String> = new Array();

  autocompleteControl = new FormControl();
  filteredOptions: Observable<String[]>;
  error: any;

  lanxcon: Array<LanXCon> = new Array();

  constructor(private server: ServerService,
              public dialogRef: MatDialogRef<LanxconComponent>,) {

   }

  ngOnInit(): void {

    this.loadData().then(() => {
      this.initFilter();
    }).catch((error)=>{
      this.error = error;
      console.log(error);
    });



  }

  initFilter(){
    this.filteredOptions = this.autocompleteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  loadData(){
    let promise = new Promise<void>(async (resolve, reject) => {

    //GET ALL Contratos
    await this.server.get_List('identificacao_unique').then(async (response: any) => {

        await response.forEach( (element:any) => {
          this.Identificacao = [...this.Identificacao, element.Identificacao];
        });
      }).catch(err => reject(err));


      resolve();

    })
    return promise;
}

private _filter(value: String): Array<String> {
  const filterValue = value.toString().toLowerCase();
  return this.Identificacao.filter(option => option.toLowerCase().includes(filterValue));
}

onCancel(){
  this.dialogRef.close()
}

onChoice(id: String){
  this.lanxcon = new Array();
  this.server.get_Value({Identificacao: id},'lanxcon').then((response: any) => {
    response.forEach(element => {
      this.lanxcon = [...this.lanxcon, element]
      console.log(this.lanxcon)
    });
  });
}

}
