import { LanXCon, PagamentosContratos } from "./tableColumns";

export class CalcTotal {

  async calcTotal(pagamentosContratos: Array<PagamentosContratos>, tipo: String): Promise<[number, number, number]>{

    let totalBruto = 0;
    let totalLiquido = 0;
    let totalPiscina = 0;

    await pagamentosContratos.forEach((element: PagamentosContratos) => {

      if (tipo == 'AirBnb') {
        totalBruto = totalBruto + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3);
        totalLiquido = totalBruto - Number(element.ValorCom);
      } else {
        totalBruto = totalBruto + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3) + Number(element.ValorCom);
        totalLiquido = totalLiquido + Number(element.Valor1) + Number(element.Valor2) + Number(element.Valor3);
      }

      totalPiscina = totalPiscina + Number(element.ValorPiscina);

    });

    return [totalBruto, totalLiquido, totalPiscina];

  }

  async calcTotalLanXCon(lanxcon: Array<LanXCon>,tipo: String): Promise<number>{

    let total = 0;

    await lanxcon.forEach((element: LanXCon) => {

      if (tipo == 'AirBnb') {
        let value;

        if (element.Tipo == 1) {
          value = -Number(element.Valor)
        } else {
          value = Number(element.Valor)
        }

        total = total + value;
      } else {
        if (element.Tipo == 0) total = total + Number(element.Valor);
      }


    });

    return total;

  }
}
