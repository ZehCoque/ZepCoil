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
  Nome_f: String;
  Responsavel: String;
}
