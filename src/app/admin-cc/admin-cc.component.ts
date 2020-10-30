import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CC } from '../classes/tableColumns';
import { NovoCCComponent } from '../novo.cc/novo.cc.component';
import { newDataTrackerService } from '../services/new-data-tracker.service';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-admin-cc',
  templateUrl: './admin-cc.component.html',
  styleUrls: ['./admin-cc.component.scss']
})
export class AdminCcComponent implements OnInit {

  CC: Array<CC>;

  constructor(
    private server: ServerService,
    private dialog: MatDialog,
    private newDataEmitter: newDataTrackerService
    ) { }

  ngOnInit(): void {

    this.newDataEmitter.currentData.subscribe(() => {
      this.loadData();
    });


  }

  openCCDialog(cc?: CC): void {
    const dialogRef = this.dialog.open(NovoCCComponent, {
      width: '500px',
      data: {cc}
    });

    dialogRef.afterClosed().subscribe(() => {
      this.newDataEmitter.newDataEmit('novoCC');
    });
  }


  loadData(){
    let promise = new Promise(async (resolve, reject) => {
    this.CC = new Array();

      //GET ALL CC
      await this.server.get_List('cc_query').then(async (response: any) => {
        await response.forEach( (CC:CC) => {
          this.CC = [...this.CC, CC];
        });
      }).catch(err => reject(err));

      resolve();

    })

    return promise;
  }

}
