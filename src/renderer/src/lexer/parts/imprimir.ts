import {
  Comma,
  DTBooleano,
  DTDecimal,
  DTInteger,
  DTString,
  Iden,
  ParLeft,
  ParRight,
  Print,
  Semi
} from '@renderer/lexer/tokens';
import { PartParser } from '@renderer/lexer/parts/template';

class Parser extends PartParser {
  constructor() {
    super();
    this.performSelfAnalysis();
  }
  argCounter: number = 1; // Mantenemos un contador para los argumentos

  evaluar = this.RULE('printStatement', () => {
    this.steps.length = 0;
    this.errorLog.length = 0;
    this.argCounter = 1;
    this.displayProcess('S -> PR16 ARG | ARG CE9 ARG');
    this.displayProcess('ARG -> (CNE | CNR | CAD | IDEN)');
    this.displayProcess('</br>');
    // this.displayProcess('PR10 -> PR10 ( ARG1 ) ;');

    this.CONSUME_WITH_RECOVERY(Print);
    this.CONSUME_WITH_RECOVERY(ParLeft);
    this.SUBRULE(this.allDataTypes);
    this.MANY(() => {
      this.displayProcess('</br>');
      this.argCounter++;
      this.CONSUME_WITH_RECOVERY(Comma);
      this.SUBRULE1(this.allDataTypes);
    });
    this.CONSUME_WITH_RECOVERY(ParRight);
    this.CONSUME_WITH_RECOVERY(Semi);
  });

  allDataTypes = this.RULE('allDataTypes', () => {
    this.displayProcess(`ARG${this.argCounter} -> (CNE | CNR | CAD | IDEN)`);

    const intents = {
      [DTInteger.name]: `ARG${this.argCounter} -> ${DTInteger.name} (Intento)`,
      [DTDecimal.name]: `ARG${this.argCounter} -> ${DTDecimal.name} (Intento)`,
      [DTString.name]: `ARG${this.argCounter} -> ${DTString.name} (Intento)`,
      [DTBooleano.name]: `ARG${this.argCounter} -> ${DTBooleano.name} (Intento)`,
      [Iden.name]: `ARG${this.argCounter} -> ${Iden.name} (Intento)`
    };

    const getDataUntil = (name: string) => {
      const intent = Object.keys(intents).indexOf(name);
      Object.values(intents)
        .slice(0, intent + 1)
        .forEach((intent) => {
          this.displayProcess(intent + ' (Exito)');
        });
    };

    this.OR([
      {
        ALT: () => {
          getDataUntil(DTInteger.name);
          this.displayProcess(`ARG${this.argCounter} -> ${DTInteger.name} (Exito)`);
          this.CONSUME_WITH_RECOVERY(DTInteger);
        }
      },
      {
        ALT: () => {
          getDataUntil(DTDecimal.name);
          this.displayProcess(`ARG${this.argCounter} -> ${DTDecimal.name} (Exito)`);
          this.CONSUME_WITH_RECOVERY(DTDecimal);
        }
      },
      {
        ALT: () => {
          getDataUntil(DTString.name);
          this.displayProcess(`ARG${this.argCounter} -> ${DTString.name} (Exito)`);
          this.CONSUME_WITH_RECOVERY(DTString);
        }
      },
      {
        ALT: () => {
          getDataUntil(DTBooleano.name);
          this.displayProcess(`ARG${this.argCounter} -> ${DTBooleano.name} (Exito)`);
          this.CONSUME_WITH_RECOVERY(DTBooleano);
        }
      },
      {
        ALT: () => {
          getDataUntil(Iden.name);
          this.displayProcess(`ARG${this.argCounter} -> ${Iden.name} (Exito)`);
          this.CONSUME_WITH_RECOVERY(Iden);
        }
      }
    ]);
  });
}

export const printParser = new Parser();
