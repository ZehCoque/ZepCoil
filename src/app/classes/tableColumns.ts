import { ThemePalette } from "@angular/material/core";

export class Entrada {
  ID?: Number;
  Descricao: String;
  Data_Entrada: any;
  CC: String;
  Div_CC: String;
  Vencimento: any;
  Valor: String;
  Observacao: String;
  Tipo:  Number; //0 para receitas, 1 para despesas, 2 para investimentos
  N_Invest: String;
  Pessoa: String;
  Responsavel: String;
  Concluido: Boolean;
  Imposto: Boolean | Number;
  Tipo_despesa: String;
  Contrato: String;
  DataPgtoContrato: Date;
}

export class CC {
  Nome: String;
  Descricao: String;
}

export class div_CC{
  Nome: String;
  Divisao: String;
  pZep?: number;
  pCoil?: number;
  pComissao?: number;
}

export class Pessoa{
  Nome: String;
  Sobrenome: String;
  CPF_CNPJ: number;
  Banco: String;
  Agencia: number;
  Conta: number;
  Tipo: String;
}

export class Contratos {
  Identificacao: String;
  Descricao: String;
  Data_inicio: Date;
  Data_termino: Date;
  CC: String;
  Div_CC: String;
  Valor: String;
  Pessoa: String;
  Tipo: String;
}

export class AlertaContratos {
  Descricao: String;
  Delta: Number;
  Data_inicio: Date;
  Data_termino: Date;
}

export interface Checkbox {
  completed: boolean;
  color: ThemePalette;
}

export class PagamentosContratos{
  checkbox?: Checkbox; //not part of MYSQL
  Identificacao: String;
  DataPgto: Date;
  Fav1: String;
  Valor1: Number;
  ValorPiscina: Number;
  Fav2: String;
  Valor2: Number;
  Fav3: String;
  Valor3: Number;
  FavCom: String;
  ValorCom: Number;
  PCom: Number;
}

export class LanXCon{
  Tipo: Number;
  Pessoa: String;
  Descricao: String;
  Responsavel: String;
  Data_Entrada: Date;
  Vencimento: Date;
  Valor: Number;
  DataPgto: Date;
}

