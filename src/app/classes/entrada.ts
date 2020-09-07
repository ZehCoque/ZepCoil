export class Entrada {
  Tipo:  number; //0 para receitas, 1 para despesas, 2 para investimentos
  ID: number;
  Nome: String;
  Data_Entrada: moment.Moment;
  CC: String;
  Div_CC: String;
  Vencimento: moment.Moment;
  Valor: Number;
  Observacao: String;
}
