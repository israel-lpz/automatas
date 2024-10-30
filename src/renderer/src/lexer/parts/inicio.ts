import { Begin } from '@renderer/lexer/tokens';
import { PartParser } from '@renderer/lexer/parts/template';

class InicioParser extends PartParser {
  constructor() {
    super();
    this.performSelfAnalysis();
  }

  inicio = this.RULE('inicio', () => {
    this.steps.length = 0;
    this.errors.length = 0;
    this.displayProcess(`S -> ${Begin.name}`);
    this.displayProcess(Begin.name);
    this.CONSUME_WITH_RECOVERY(Begin);
  });

  // Método personalizado para mostrar los pasos del proceso de análisis
  displayProcess(production: string) {
    this.steps.push(production);
    // Aquí podrías expandir cómo se visualiza en la consola o en una interfaz
  }
}

export const inicioParser = new InicioParser();
