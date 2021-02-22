interface sortJson {
  active: boolean,
  dir: string
}

export class ContratosActiveFilters {
  Identificacao: String = '';
  Descricao: String = '';
  Data_inicio: String = '';
  Data_termino: String = '';
  CC: String = '';
  Div_CC: String = '';
  Valor: String = '';
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




