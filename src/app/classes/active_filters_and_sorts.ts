interface sortJson {
  active: boolean,
  dir: string
}

interface dirMsgJson{
  up: string;
  down: string;
}

export interface dateOptions{
  equals: String,
  greater: String,
  smaller: String
  greater_and_equalTo: String,
  smaller_and_equalTo: String,
}

export class ActiveFilters {
    Descricao: String = '';
    Data_Entrada: dateOptions;
    CC: String = '';
    Div_CC: String = '';
    Vencimento: dateOptions;
    Valor: dateOptions;
    Tipo:  String = '';
    N_Invest: String = '';
    Pessoa: String = '';
    Responsavel: String = '';
    Contrato: String = '';
  }

export class ActiveSorts {
  Descricao: sortJson = {active: false, dir: 'arrow_downward'};
  Data_Entrada: sortJson = {active: false, dir: 'arrow_downward'};
  CC: sortJson = {active: false, dir: 'arrow_downward'};
  Div_CC: sortJson = {active: false, dir: 'arrow_downward'};
  Vencimento: sortJson = {active: false, dir: 'arrow_downward'};
  Valor: sortJson = {active: false, dir: 'arrow_downward'};
  Tipo:  sortJson = {active: false, dir: 'arrow_downward'};
  N_Invest: sortJson = {active: false, dir: 'arrow_downward'};
  Pessoa: sortJson = {active: false, dir: 'arrow_downward'};
  Responsavel: sortJson = {active: false, dir: 'arrow_downward'};
  Contrato: sortJson = {active: false, dir: 'arrow_downward'};
}

export class SortMessages{
  forDates:dirMsgJson = {up: "Mais antigo para mais novo", down:"Mais novo para mais antigo"};
  forText:dirMsgJson = {up: "A - Z", down: "Z - A"};
  forNumber:dirMsgJson = {up: "Menor para o maior", down: "Maior para o menor"};
  forType:dirMsgJson = {up: "Recebimentos primeiro" , down: "Investimentos primeiro"};
  forType2:dirMsgJson = {up: "Recebimentos primeiro" , down: "Devoluções primeiro"};
  forExpire:dirMsgJson = {up: "Mais curto para o mais longo" , down: "Mais longo para o mais curto"};
}

export class FilterLists {
  Descricao: Array<String>;
  CC: Array<String>;
  Div_CC: Array<String>;
  Tipo:  Array<Number>;
  N_Invest: Array<String>;
  Pessoa: Array<String>;
  Responsavel: Array<String>;
  Contrato: Array<String>;
  DataPgtoContrato: Array<String>;
}

