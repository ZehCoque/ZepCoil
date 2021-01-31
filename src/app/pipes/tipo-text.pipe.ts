import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipoText'
})
export class TipoTextPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    if (value == "A") {
      return "AirBnb"
    } else if (value == "F") {
      return "Fixa"
    } else if (value = "C") {
      return "Contrato"
    }

    return null;
  }

}
