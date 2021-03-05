import { PagamentosContratos } from "./tableColumns";

export class CalcTotal {

  async calcTotal(pagamentosContratos): Promise<[number, number]>{

    let totalValor = 0;
    let totalPiscina = 0;

    await pagamentosContratos.forEach((element: PagamentosContratos) => {

      totalValor = totalValor + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3);
      totalPiscina = totalPiscina + Number(element.ValorPiscina);

    });

    return [totalValor, totalPiscina];

  }
}
