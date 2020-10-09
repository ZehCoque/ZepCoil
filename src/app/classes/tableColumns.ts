export class Entrada {
  ID?: Number;
  Descricao: String;
  Data_Entrada: Date;
  CC: String;
  Div_CC: String;
  Vencimento: Date;
  Valor: Number;
  Observacao: String;
  Tipo:  number; //0 para receitas, 1 para despesas, 2 para investimentos
  N_Invest: number;
  Pessoa: String;
  Responsavel: String;
}

export class CC {
  Nome: string;
  Descricao: string;
}

export class div_CC{
  Nome: string;
  Divisao: string;
  pZep: number;
  pCoil: number;
  pComissao: number;
}

export class Pessoa{
  Nome: string;
  Sobrenome: string;
  CPF_CNPJ: number;
  Banco: string;
  Agencia: number;
  Conta: number;
  Tipo: string;
}
