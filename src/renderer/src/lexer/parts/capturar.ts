import { Capturar, Comma, Iden, Semi } from '@renderer/lexer/tokens';
import { PartParser } from '@renderer/lexer/parts/template';

class Parser extends PartParser {
  constructor() {
    super();
    this.performSelfAnalysis();
  }

  evaluar = this.RULE('capturarStatement', () => {
    this.steps.length = 0;
    this.errorLog.length = 0;
    this.displayProcess('S -> capturarStatement');

    // Esta línea indica la producción inicial
    let currentProduction = `capturarStatement -> ${Capturar.name}`;

    // Consumimos 'Capturar'
    this.CONSUME(Capturar, { ERR_MSG: 'Se esperaba la palabra reservada "capturar"' });

    currentProduction += ' Iden';
    // Consumimos el primer identificador
    this.CONSUME(Iden, { ERR_MSG: 'Se esperaba un identificador' });

    this.MANY(() => {
      // Actualizamos la producción actual después de consumir el identificador
      currentProduction += ` ${Comma.name} ${Iden.name}`;

      // Consumir la coma y el siguiente identificador
      this.CONSUME(Comma, { ERR_MSG: 'Se esperaba ","' });
      this.CONSUME_WITH_RECOVERY2(Iden, { ERR_MSG: 'Se esperaba un identificador' });
    });

    this.CONSUME(Semi, { ERR_MSG: 'Se esperaba un ;' });
    currentProduction += ' ;';

    // Esta línea asegura que al final de la regla mostramos la producción final esperada.
    this.displayProcess(currentProduction);
  });
}

export const capturarParser = new Parser();
