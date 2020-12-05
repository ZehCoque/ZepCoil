import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { div_CC } from '../classes/tableColumns';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ErrorMatcherDirective } from '../directives/error-matcher.directive';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-novo.cc',
  templateUrl: './novo.cc.component.html',
  styleUrls: ['./novo.cc.component.scss']
})
export class NovoCCComponent implements OnInit {

  novoCCForm: FormGroup;
  divCCForm: FormGroup;
  errorMatcher: ErrorMatcherDirective;
  divCCArray: Array<String> = new Array();
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  error_CC: string;
  error_div_CC: string;
  div_CC: div_CC[];

  loading: Boolean = true;

  constructor(private formBuilder: FormBuilder,
              private server: ServerService,
              public dialogRef: MatDialogRef<NovoCCComponent>,
              @Inject(MAT_DIALOG_DATA) public preloaded,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.novoCCForm = this.formBuilder.group({
      Abreviacao: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern("^[A-Z1-9]{1,3}$")
      ])),
      Descricao: new FormControl('', Validators.required),
    });

    this.divCCForm = this.formBuilder.group({
      Div_CC: new FormControl('',Validators.required),
    });

    if (this.preloaded.cc) {
      this.novoCCForm.controls.Abreviacao.setValue(this.preloaded.cc.Nome);
      this.novoCCForm.controls.Descricao.setValue(this.preloaded.cc.Descricao);

      this.get_div_cc(this.preloaded.cc.Nome).then(() => {
        this.div_CC.forEach(element => {
          this.divCCArray = [...this.divCCArray, element.Divisao ]
        });

      });


    }

    this.loading = false;
    this.dialogRef.disableClose = false;

  }

  get_div_cc(Nome_CC:String){
    this.div_CC = new Array<div_CC>();
    let promise = new Promise((resolve,reject) => {
      this.server.get_Value({Nome: Nome_CC},'div_cc_query').then(async (response: any) => {
      await response.forEach( (div_CC:div_CC) => {
        this.div_CC = [...this.div_CC, div_CC];
      });
      resolve(this.div_CC.length);
    }).catch(err => {

      reject(err);
    });
    })

    return promise
  }

  addDivCC(){

    this.error_div_CC = '';

    let Divisao = this.divCCForm.get('Div_CC').value

    this.divCCForm.reset();
    this.divCCForm.untouched;

    let hasDuplicate = this.hasDupes([...this.divCCArray,Divisao]);

    if (!hasDuplicate){
      this.divCCArray = [...this.divCCArray,Divisao];

      setTimeout(() => {
        this.viewport.scrollToIndex(this.viewport.getDataLength());
      }, 0);
    } else {

      this.error_div_CC = 'Conflict';

    }

  }

  hasDupes(array) {
    return new Set(array).size !== array.length
  }

  removeDivCC(id:number){
    this.divCCArray = this.divCCArray.filter((item, index) => index !== id);

  }

  onDelete(){

    const confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Tem certeza que deseja deletar?"
    });

    confirmationDialog.afterClosed().subscribe(result => {
      if (result){
        this.dialogRef.disableClose = true;
        this.error_CC = '';
        this.error_div_CC = '';
        this.loading = true;
        this.delete_cc()
        .then(() => this.onCancel('CCExcluido'))
        .catch((error) => {
          this.dialogRef.disableClose = false;
          this.error_div_CC = error
        })

    }

  })
}

  delete_cc(){

    this.loading = true;
    let promise = new Promise((resolve,reject) => {
      this.server.delete_Value({Nome: this.preloaded.cc.Nome},'div_cc_query_delete').then(() => {
        this.server.delete_Value({Nome: this.preloaded.cc.Nome},'cc_query_delete').then(() => {
          resolve();
        }).catch(error => {
          reject(error)
          console.log(error);

        })
      }).catch(error => {
        console.log(error);
        reject(error);
      })
    })

    return promise;
  }

  onSubmit(){
    this.loading = true;
    this.dialogRef.disableClose = true;
    this.error_CC = '';
    this.error_div_CC = '';

    if (this.preloaded.cc) {
      this.delete_cc().then(() => {
        this.addNew().then(() => {

                  //Update lançamentos
        this.server.update_value({old: this.preloaded.cc.Nome, new: this.novoCCForm.get('Abreviacao').value}, 'main_table_query_update_CC')
        .then(() => {
          this.onCancel('novoCC');
        })
        .catch(error => console.log(error));
        });

        return;
      }).catch((error) => {
        this.loading = false;
        this.dialogRef.disableClose = false;
        this.error_div_CC = error;
      })

    } else {
      this.addNew().then(() => {
        this.onCancel('novoCC');
      });
    }

  }

  addNew(){

    let promise = new Promise((resolve,reject) => {
      let CC = {
        Nome: this.novoCCForm.get('Abreviacao').value,
        Descricao: this.novoCCForm.get('Descricao').value
      }

      this.server.add_List(CC,'cc_query_add').then(async() => {

        this.divCCArray.forEach(async (element) => {
          await this.server.add_List({ Nome: CC.Nome, Divisao: element }, 'div_cc_query_add')
          .then(() => {
            resolve();
          })
          .catch(error => {
            console.log(error);
            this.error_div_CC = error;
            reject(error)
          });
        });

      }).catch(error => {
        console.log(error);
        this.error_CC = error;
        reject(error);
      })
    })

    return promise;

  }


  onCancel(data?){
    this.dialogRef.close(data);
  }

}
