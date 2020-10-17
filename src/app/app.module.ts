import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';

import { MaterialModule } from './material.module'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {LOCALE_ID} from '@angular/core';
import { MomentModule } from 'ngx-moment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyPipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import localePtBr from '@angular/common/locales/pt';

import { registerLocaleData } from '@angular/common';
import { EditRowComponent } from './edit-row/edit-row.component';
import { FocusNextDirective } from './directives/focus-next.directive';
import { LoginComponent } from './login/login.component';
import { LancamentosComponent } from './lancamentos/lancamentos.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { AuthenticationService } from './services/authentication.service';
import { appInitializer } from './helpers/app.initializer';
import { TipoPipe } from './pipes/tipo.pipe';
import { NovoCCComponent } from './novo.cc/novo.cc.component';
import { NovaPessoaComponent } from './nova-pessoa/nova-pessoa.component';
import { UppercaseDirective } from './directives/uppercase.directive';
import { ErrormessagePipe } from './pipes/errormessage.pipe';

registerLocaleData(localePtBr);

@NgModule({
  declarations: [
    AppComponent,
    EditRowComponent,
    FocusNextDirective,
    LoginComponent,
    LancamentosComponent,
    TipoPipe,
    NovoCCComponent,
    NovaPessoaComponent,
    UppercaseDirective,
    ErrormessagePipe,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        'm': 59
      }
    })
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: "pt-BR"
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    CurrencyPipe,
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthenticationService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
