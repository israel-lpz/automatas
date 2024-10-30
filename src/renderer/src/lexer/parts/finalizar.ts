import { End } from '@renderer/lexer/tokens';
import { PartParser } from '@renderer/lexer/parts/template';

class Parser extends PartParser {
  constructor() {
    super();
    this.performSelfAnalysis();
  }

  evaluar = this.RULE('finalizar', () => {
    this.steps.length = 0;
    this.errors.length = 0;
    this.displayProcess(`S -> ${End.name}`);
    this.displayProcess(End.name);
    this.CONSUME_WITH_RECOVERY(End);
  });
}

export const endParser = new Parser();
