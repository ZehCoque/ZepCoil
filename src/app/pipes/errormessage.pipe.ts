import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'errorMessage'
})
export class ErrormessagePipe implements PipeTransform {

  transform(error_code: string): string {

    if (error_code === 'Conflict'){
      return 'Valor inserido já existe'
    }

    if (error_code === 'Bad Request'){
      return 'Usuário e/ou senha inválidos'
    }

    return 'Erro desconhecido';
  }

}
