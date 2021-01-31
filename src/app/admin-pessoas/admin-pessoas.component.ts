import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Pessoa } from '../classes/tableColumns';
import { NovaPessoaComponent } from '../nova-pessoa/nova-pessoa.component';
import { newDataTrackerService } from '../services/new-data-tracker.service';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-admin-pessoas',
  templateUrl: './admin-pessoas.component.html',
  styleUrls: ['./admin-pessoas.component.scss']
})
export class AdminPessoasComponent implements OnInit {

  Pessoas: Array<Pessoa>
  emitterSub: any;

  constructor(
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService,
    public dialogRef: MatDialogRef<AdminPessoasComponent>,
    ) { }

  ngOnInit(): void {

    this.emitterSub = this.newDataEmitter.currentData.subscribe(() => {
      this.loadData();
    });


  }

  ngOnDestroy(){
    this.emitterSub.unsubscribe();
  }

  openPessoaDialog(pessoa?: Pessoa): void {
    const dialogRef = this.dialog.open(NovaPessoaComponent, {
      width: '1000px',
      data: {pessoa}
    });

    dialogRef.afterClosed().subscribe((results) => {
      this.newDataEmitter.newDataEmit(results);
    });
  }


  loadData(){
    let promise = new Promise<void>(async (resolve, reject) => {
    this.Pessoas = new Array();

      //GET ALL PESSOA
      await this.server.get_List('pessoa_query').then(async (response: any) => {
        await response.forEach( (pessoa:Pessoa) => {
          this.Pessoas = [...this.Pessoas, pessoa];
        });
      }).catch(err => reject(err));

      resolve();

    })

    return promise;
  }

  onCancel(){
    this.dialogRef.close();
  }

}

