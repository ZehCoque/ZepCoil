import { LanXCon, PagamentosContratos } from "./tableColumns";

export class CalcTotal {

  async calcTotal(pagamentosContratos: Array<PagamentosContratos>): Promise<[number, number]>{

    let totalValor = 0;
    let totalPiscina = 0;

    await pagamentosContratos.forEach((element: PagamentosContratos) => {

      totalValor = totalValor + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3);
      totalPiscina = totalPiscina + Number(element.ValorPiscina);

    });

    return [totalValor, totalPiscina];

  }

  async calcTotalLanXCon(lanxcon: Array<LanXCon>): Promise<number>{

    let total = 0;

    await lanxcon.forEach((element: LanXCon) => {

      if (element.Tipo == 1) total = total - Number(element.Valor);
      else total = total + Number(element.Valor);

    });

    return total;

  }
}
