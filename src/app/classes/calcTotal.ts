import { LanXCon, PagamentosContratos } from "./tableColumns";

export class CalcTotal {

  async calcTotal(pagamentosContratos: Array<PagamentosContratos>): Promise<[number, number, number]>{

    let totalBruto = 0;
    let totalLiquido = 0;
    let totalPiscina = 0;

    await pagamentosContratos.forEach((element: PagamentosContratos) => {

      totalBruto = totalLiquido + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3) + Number(element.ValorCom);
      totalLiquido = totalLiquido + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3);
      totalPiscina = totalPiscina + Number(element.ValorPiscina);

    });

    return [totalBruto, totalLiquido, totalPiscina];

  }

  async calcTotalLanXCon(lanxcon: Array<LanXCon>): Promise<number>{

    let total = 0;

    await lanxcon.forEach((element: LanXCon) => {

      if (element.Tipo == 0) total = total + Number(element.Valor);

    });

    return total;

  }
}
