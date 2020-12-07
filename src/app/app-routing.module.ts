import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContratosComponent } from './contratos/contratos.component';
import { AuthGuard } from './helpers/auth.guard';
import { LancamentosComponent } from './lancamentos/lancamentos.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'lancamentos', component: LancamentosComponent, canActivate: [AuthGuard], data: {state: 1} },
  { path: 'terceiros', component: LancamentosComponent, canActivate: [AuthGuard], data: {state: 2} },
  { path: 'contratos', component: ContratosComponent, canActivate: [AuthGuard], data: {state: 3} },
  { path: 'login', component: LoginComponent },

  // otherwise
  { path: '**', redirectTo: 'contratos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
