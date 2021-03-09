function filter(init_query_string,active_filters) {

  let options = ['equals','greater','smaller','greater_and_equalTo','smaller_and_equalTo'];
  let signs = ['=', '>', '<', '>=', '<='];



  for (var key in active_filters) {
    if (active_filters.hasOwnProperty(key)) {
        if (active_filters[key] !== ''){
          let value;
          let sign = "=";
          if (key === 'Data_Entrada' || key === 'Data_inicio' || key === 'Data_termino' || key === 'Vencimento' || key === 'Valor' || key === 'Contrato'){

            for (var type in active_filters[key]){

              if (active_filters[key].hasOwnProperty(type)){
                if (active_filters[key][type] !== ''){

                  let index = options.indexOf(type);
                  sign = signs[index];

                  if (active_filters[key][type] === 'notNull'){

                    value = "NULL"
                    sign = "IS NOT"

                  } else if (active_filters[key][type] === 'onlyNull') {

                    value = "NULL"
                    sign = "IS"

                  } else if (key === 'Data_Entrada' || key === 'Vencimento') {

                    value = ' Date(\'' + active_filters[key][type].substring(0,10) + '\')';

                  } else value = ' \'' + active_filters[key][type] + '\'';

                  init_query_string = init_query_string + ' AND ' + key + ' ' + sign + ' ' + value;
                }
              }

            }
            return init_query_string;

          }else {
            value = active_filters[key];
          }
          init_query_string = init_query_string + ' AND ' + key + ' ' + sign +' \'' + value + '\'';
        }
    }
  }

return init_query_string;
}

function sort(init_query_string,active_sorts,dir){

  for (var key in active_sorts) {
    if (active_sorts.hasOwnProperty(key)) {
        if (active_sorts[key].active == true){
          if (active_sorts[key].dir === "arrow_downward") {
            dir = "ASC"
          } else {
            dir = "DESC"
          }
          init_query_string = init_query_string + ' ORDER BY ' + key + ' ' + dir;
          break;
        }
    }
  }

  return init_query_string;
}
module.exports = {filter: filter, sort: sort};
