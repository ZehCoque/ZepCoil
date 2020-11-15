interface sortJson {
  active: boolean,
  dir: string
}

interface dirMsgJson{
  up: string;
  down: string;
}

export class ContratosActiveFilters {
  Descricao: String = '';
  Data_inicio: String = '';
  Data_termino: String = '';
  CC: String;
  Div_CC: String;
  Valor: String;
  Pessoa: String;
  Tipo: String;
  }

export class ContratosActiveSorts {
  Descricao: sortJson = {active: false, dir: 'arrow_downward'};
  Data_inicio: sortJson = {active: false, dir: 'arrow_downward'};
  Data_termino: sortJson = {active: false, dir: 'arrow_downward'};
  CC: sortJson = {active: false, dir: 'arrow_downward'};
  Div_CC: sortJson = {active: false, dir: 'arrow_downward'};
  Valor: sortJson = {active: false, dir: 'arrow_downward'};
  Tipo:  sortJson = {active: false, dir: 'arrow_downward'};
  Pessoa: sortJson = {active: false, dir: 'arrow_downward'};
}




