import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Tipo'
})
export class TipoPipe implements PipeTransform {

  transform(tipo: string): string {
    if (tipo == "0") {
      return "Receita"
    }
    if (tipo == "1") {
      return "Despesa"
    }
    if (tipo == "2") {
      return "Investimento"
    }
    if (tipo == "3"){
      return "Recebimento"
    }
    if (tipo == "4"){
      return "Devolução"
    }
    return tipo;
  }

}
