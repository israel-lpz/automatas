import { ConsumeMethodOpts, CstParser, TokenType } from 'chevrotain';
import { allTokens, ParLeft, ParRight } from '@renderer/lexer/tokens';

export class PartParser extends CstParser {
  constructor() {
    super(allTokens, {
      maxLookahead: 5,
      recoveryEnabled: true
    });
    // this.performSelfAnalysis();
  }
  steps: string[] = [];
  errorLog: string[] = [];

  evaluar() {}

  // Método personalizado para mostrar los pasos del proceso de análisis
  displayProcess(production: string) {
    this.steps.push(production);
    // Aquí podrías expandir cómo se visualiza en la consola o en una interfaz
  }

  // Personaliza la función de consumo con recuperación
  CONSUME_WITH_RECOVERY(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  CONSUME_WITH_RECOVERY2(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME2(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  CONSUME_WITH_RECOVERY3(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME3(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  CONSUME_WITH_RECOVERY4(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME4(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  CONSUME_WITH_RECOVERY5(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME5(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  CONSUME_WITH_RECOVERY6(tokType: TokenType, options?: ConsumeMethodOpts) {
    try {
      this.CONSUME6(tokType, options);
    } catch (error) {
      this.reportParsingError(tokType);
    }
  }

  getDataUntil = (intents: Record<string, any>) => {
    return (name: string) => {
      const intent = Object.keys(intents).indexOf(name);
      Object.values(intents)
        .slice(0, intent + 1)
        .forEach((intent) => {
          this.displayProcess(intent);
        });
      this.displayProcess(intents[name] + ' (Exito)');
    };
  };

  reportParsingError(expectedToken: TokenType) {
    const nextToken = this.LA(1);

    this.errorLog.push(`
      Se esperaba: ${expectedToken.name}
      Se encontró: ${nextToken.tokenType.name}
    `);

    const errorMsg = `
      Error de análisis. Se esperaba: ${expectedToken.name}.
      Se encontró: ${JSON.stringify(nextToken)}
      Posición del token: ${nextToken.startOffset}
    `;
    if (expectedToken === ParLeft || expectedToken === ParRight) {
      console.error('Error crítico: Se perdió un paréntesis. ' + errorMsg);
    }
  }
}
