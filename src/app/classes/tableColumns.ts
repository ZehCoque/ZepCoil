export class Entrada {
  ID?: Number;
  Descricao: String;
  Data_Entrada: Date;
  CC: String;
  Div_CC: String;
  Vencimento: Date;
  Valor: String;
  Observacao: String;
  Tipo:  number; //0 para receitas, 1 para despesas, 2 para investimentos
  N_Invest: number;
  Pessoa: String;
  Responsavel: String;
  Concluido: Boolean;
  Imposto: Boolean | Number;
  Tipo_despesa: String;
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
export class contratos{
  ID?: Number;
  Nome: String;
  Data_inicio: Date;
  Data_termino: Date;
  Valor: String;
  CC: String;
  Div_CC: String;
  Descricao: String;
  Tipo: String;
}

export class Contratos {
  ID?: Number;
  Descricao: String;
  Data_inicio: Date;
  Data_termino: Date;
  CC: String;
  Div_CC: String;
  Valor: String;
  Pessoa: String;
  Tipo: String;
  PCoil: Number;
  PZep: Number;
  PComissao: Number;
}


