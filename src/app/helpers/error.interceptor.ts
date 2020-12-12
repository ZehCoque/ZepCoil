import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorModalComponent } from '../error-modal/error-modal.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,
                public dialog: MatDialog) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status) && this.authenticationService.userValue) {
                // auto logout if 401 or 403 response returned from api
                this.authenticationService.logout();
            }

            if ([404].includes(err.status)) {
              this.openErrorDialog(err);
          }

            const error = (err && err.error && err.error.message) || err.statusText;
            console.error(err);
            return throwError(error);
        }))
    }

    openErrorDialog(err): void {
      if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) return;
      const dialogRef = this.dialog.open(ErrorModalComponent, {
        width: '500px',
        data: {err}
      });

      let sub = dialogRef.afterClosed().subscribe(() => {
        sub.unsubscribe();
      });
    }
}
