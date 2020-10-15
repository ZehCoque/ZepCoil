function filter(init_query_string,active_filters) {

  for (var key in active_filters) {
    if (active_filters.hasOwnProperty(key)) {
        if (active_filters[key] !== ''){
          let value;
          if (key === 'Data_Entrada' || key === 'Vencimento'){
            value = active_filters[key].substring(0,10);
          }else {
            value = active_filters[key];
          }
          init_query_string = init_query_string + ' AND ' + key + ' = \'' + value + '\'';
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
