interface sortJson {
  active: boolean,
  dir: string
}

export interface dateOptions{
  equals: String,
  greater: String,
  smaller: String
  greater_and_equalTo: String,
  smaller_and_equalTo: String,
}

export class ContratosActiveFilters {
  Identificacao: String = '';
  Descricao: String = '';
  Data_inicio: dateOptions;
  Data_termino: dateOptions;
  CC: String = '';
  Div_CC: String = '';
  Valor: dateOptions;
  Pessoa: String = '';
  Tipo: String = '';
  }

export class ContratosActiveSorts {
  Identificacao: sortJson = {active: false, dir: 'arrow_downward'};
  Descricao: sortJson = {active: false, dir: 'arrow_downward'};
  Data_inicio: sortJson = {active: false, dir: 'arrow_downward'};
  Data_termino: sortJson = {active: false, dir: 'arrow_downward'};
  CC: sortJson = {active: false, dir: 'arrow_downward'};
  Div_CC: sortJson = {active: false, dir: 'arrow_downward'};
  Valor: sortJson = {active: false, dir: 'arrow_downward'};
  Tipo:  sortJson = {active: false, dir: 'arrow_downward'};
  Pessoa: sortJson = {active: false, dir: 'arrow_downward'};
}

export class FilterListsContratos {
  Identificacao: Array<String>;
  Pessoa: Array<String>;
  Descricao: Array<String>;
  CC:  Array<Number>;
  Div_CC: Array<String>;
  Tipo: Array<String>;
}





