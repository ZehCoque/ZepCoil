import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnName'
})
export class ColumnNamePipe implements PipeTransform {

  MySQL = ['ID','Tipo','Descricao','Data_Entrada','Vencimento','Div_CC','Observacao','N_Invest','Pessoa','CC','Responsavel','Valor','Identificacao','Data_inicio','Data_termino'];
  Human = ['ID','Tipo','Descrição','Data de Entrada','Vencimento','Divisão C.C.','Observação','Nº de Investimento','Pessoa','Centro de Custo','Responsável','Valor','Identificação','Data de início','Data de término']

  transform(value: string, ...args: unknown[]): string {

    let index = this.MySQL.indexOf(value);

    return this.Human[index];
  }

}
