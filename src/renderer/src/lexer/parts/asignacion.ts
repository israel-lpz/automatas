import {
  Assign,
  DTBooleano,
  DTDecimal,
  DTInteger,
  DTString,
  GT,
  GTE,
  Iden,
  LTE,
  Or,
  ParLeft,
  ParRight,
  Semi,
  Var,
  LT,
  EQ,
  Mod,
  Mul,
  Minus,
  NEQ,
  Add,
  Not,
  Div
} from '@renderer/lexer/tokens';
import { PartParser } from '@renderer/lexer/parts/template';

class Parser extends PartParser {
  constructor() {
    super();
    this.performSelfAnalysis();
  }
  argCounter: number = 1; // Mantenemos un contador para los argumentos

  compCounter = 1;
  addCounter = 1;
  mulCounter = 1;
  termCounter = 1;

  evaluar = this.RULE('evaluar', () => {
    this.steps.length = 0;
    this.errorLog.length = 0;
    this.argCounter = 1;
    this.termCounter = 1;

    this.steps.push('S → var PR11 PR12 PR13 PR14');
    this.steps.push('</br>');
    this.steps.push('PR11 → IDEN CE8 ARG4');
    this.steps.push('ARG4 → OPA | IDEN | CNUM');
    this.steps.push('OPA → CE1 OPA CE2');
    this.steps.push('OPA → ARG4 OA ARG4');
    this.steps.push('OA → OP1 | OP2 | OP3 | OP4 | OP5');
    this.steps.push('</br>');
    this.steps.push('PR12 → IDEN CE8 TD5');
    this.steps.push('IDEN → id1 | idn');
    this.steps.push('CE8 → CE8 TD5 ');
    this.steps.push('</br>');
    this.steps.push('PR13 → IDEN CE8 ARG5');
    this.steps.push('ARG5 → TD2 | TD3 | PR15');
    this.steps.push('</br>');
    this.steps.push('PR14 → IDEN CE8 TD4');
    this.steps.push('IDEN → id1 | idn');
    this.steps.push('</br>');
    this.steps.push('Expresiones y operaciones:');
    this.steps.push('CE8 → id1 | idn');
    this.steps.push('CNUM → TD1 | TD2 | TD3 | TD4 | TD5');
    this.steps.push('</br>');
    this.steps.push('Evaluando...');
    this.OR([
      { ALT: () => this.SUBRULE(this.declarationOrAssignment) },
      { ALT: () => this.SUBRULE(this.assignment) }
      //
    ]);
  });

  declarationOrAssignment = this.RULE('declarationOrAssignment', () => {
    this.displayProcess(`${Var.name} ${Iden.name} ${Semi.name}`);
    this.CONSUME_WITH_RECOVERY(Var, { ERR_MSG: 'Se esperaba la palabra reservada "var"' });
    this.CONSUME_WITH_RECOVERY(Iden, { ERR_MSG: 'Se esperaba un identificador' });

    this.OPTION(() => {
      this.displayProcess(`${Assign.name}`);
      this.CONSUME_WITH_RECOVERY(Assign, { ERR_MSG: 'Se esperaba =' });
      this.OR1([
        {
          ALT: () => {
            this.displayProcess(`${DTString.name}`);
            this.CONSUME_WITH_RECOVERY(DTString);
          }
        },
        {
          ALT: () => {
            this.SUBRULE(this.expression);
          }
        }
        //
      ]);
    });
    this.CONSUME_WITH_RECOVERY(Semi, { ERR_MSG: 'Se esperaba ;' });
  });

  assignment = this.RULE('assignment', () => {
    this.displayProcess(`${Iden.name} ${Assign.name} ${Semi.name}`);
    this.CONSUME_WITH_RECOVERY(Iden, { ERR_MSG: 'Se esperaba un identificador' });
    this.CONSUME_WITH_RECOVERY(Assign, { ERR_MSG: 'Se esperaba =' });
    this.OR1([
      { ALT: () => this.CONSUME_WITH_RECOVERY(DTString) },
      { ALT: () => this.SUBRULE(this.expression) }
      //
    ]);
    this.CONSUME_WITH_RECOVERY(Semi, { ERR_MSG: 'Se esperaba ;' });
  });

  // Regla principal para expresiones
  expression = this.RULE('expression', () => {
    // this.OR([{ ALT: () => this.SUBRULE(this.comparisonExpression) }]);
    this.SUBRULE(this.comparisonExpression);
  });

  // Regla para expresiones de comparación
  comparisonExpression = this.RULE('comparisonExpression', () => {
    this.SUBRULE(this.additiveExpression); // Inicia con la expresión aditiva

    this.compCounter = 1;
    this.MANY(() => {
      this.displayProcess('Evaluando expresión de comparación');
      this.displayProcess('</br>');
      const intents = {
        [EQ.name]: `ARG-Comparacion${this.compCounter} -> ${EQ.name} (Intento)`,
        [NEQ.name]: `ARG-Comparacion${this.compCounter} -> ${NEQ.name} (Intento)`,
        [GT.name]: `ARG-Comparacion${this.compCounter} -> ${GT.name} (Intento)`,
        [GTE.name]: `ARG-Comparacion${this.compCounter} -> ${GTE.name} (Intento)`,
        [LT.name]: `ARG-Comparacion${this.compCounter} -> ${LT.name} (Intento)`,
        [LTE.name]: `ARG-Comparacion${this.compCounter} -> ${LTE.name} (Intento)`,
        [Or.name]: `ARG-Comparacion${this.compCounter} -> ${Or.name} (Intento)`,
        [Not.name]: `ARG-Comparacion${this.compCounter} -> ${Not.name} (Intento)`
      };
      const getDataUntil = this.getDataUntil(intents);

      // Controles de múltiples comparaciones (ej. a < b < c)
      this.OR([
        {
          ALT: () => {
            getDataUntil(EQ.name);
            this.CONSUME_WITH_RECOVERY(EQ, { ERR_MSG: 'Se esperaba un =' });
            this.SUBRULE2(this.additiveExpression); // Uso de SUBRULE2 para diferenciación
          }
        },
        {
          ALT: () => {
            getDataUntil(NEQ.name);
            this.CONSUME_WITH_RECOVERY(NEQ, { ERR_MSG: 'Se esperaba un !=' });
            this.SUBRULE3(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(GT.name);
            this.CONSUME_WITH_RECOVERY(GT, { ERR_MSG: 'Se esperaba un >' });
            this.SUBRULE4(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(GTE.name);
            this.CONSUME_WITH_RECOVERY(GTE, { ERR_MSG: 'Se esperaba un >=' });
            this.SUBRULE5(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(LT.name);
            this.CONSUME_WITH_RECOVERY(LT, { ERR_MSG: 'Se esperaba un <' });
            this.SUBRULE6(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(LTE.name);
            this.CONSUME_WITH_RECOVERY(LTE, { ERR_MSG: 'Se esperaba un <=' });
            this.SUBRULE7(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(Or.name);
            this.CONSUME_WITH_RECOVERY(Or, { ERR_MSG: 'Se esperaba un ||' });
            this.SUBRULE8(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(Not.name);
            this.CONSUME_WITH_RECOVERY(Not, { ERR_MSG: 'Se esperaba un !' });
            this.SUBRULE9(this.additiveExpression);
          }
        }
      ]);
      this.compCounter++;
    });
  });

  // Regla para expresiones aditivas
  additiveExpression = this.RULE('additiveExpression', () => {
    this.SUBRULE(this.multiplicativeExpression); // Inicio con multiplicativas

    this.addCounter = 1;
    const intents = {
      [Add.name]: `ARG-Add${this.addCounter} -> ${Add.name} (Intento)`,
      [Minus.name]: `ARG-Add${this.addCounter} -> ${Minus.name} (Intento)`
    };
    const getDataUntil = this.getDataUntil(intents);
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            getDataUntil(Add.name);
            this.CONSUME_WITH_RECOVERY(Add, { ERR_MSG: 'Se esperaba un +' });
            this.SUBRULE2(this.multiplicativeExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(Minus.name);
            this.CONSUME_WITH_RECOVERY(Minus, { ERR_MSG: 'Se esperaba un -' });
            this.SUBRULE3(this.multiplicativeExpression);
          }
        }
      ]);
      this.addCounter++;
    });
  });

  // Regla para expresiones multiplicativas
  multiplicativeExpression = this.RULE('multiplicativeExpression', () => {
    this.SUBRULE(this.primaryExpression); // Inicio con expresiones primarias
    this.mulCounter = 1;
    const intents = {
      [Mul.name]: `ARG-Mul${this.mulCounter} -> ${Mul.name} (Intento)`,
      [Div.name]: `ARG-Mul${this.mulCounter} -> ${Div.name} (Intento)`,
      [Mod.name]: `ARG-Mul${this.mulCounter} -> ${Mod.name} (Intento)`
    };
    const getDataUntil = this.getDataUntil(intents);
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            getDataUntil(Mul.name);
            this.CONSUME_WITH_RECOVERY(Mul, { ERR_MSG: 'Se esperaba un *' });
            this.SUBRULE2(this.primaryExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(Div.name);
            this.CONSUME_WITH_RECOVERY(Div, { ERR_MSG: 'Se esperaba un /' });
            this.SUBRULE3(this.primaryExpression);
          }
        },
        {
          ALT: () => {
            getDataUntil(Mod.name);
            this.CONSUME_WITH_RECOVERY(Mod, { ERR_MSG: 'Se esperaba un %' });
            this.SUBRULE4(this.primaryExpression);
          }
        }
      ]);
      this.termCounter++;
      this.mulCounter++;
    });
  });

  // Regla para expresiones primarias
  primaryExpression = this.RULE('primaryExpression', () => {
    const intents = {
      [DTInteger.name]: `ARG-Term${this.termCounter} -> ${DTInteger.name} (Intento)`,
      [DTDecimal.name]: `ARG-Term${this.termCounter} -> ${DTDecimal.name} (Intento)`,
      [DTBooleano.name]: `ARG-Term${this.termCounter} -> ${DTBooleano.name} (Intento)`,
      [Iden.name]: `ARG-Term${this.termCounter} -> ${Iden.name} (Intento)`
    };
    const getDataUntil = this.getDataUntil(intents);
    this.OR([
      {
        ALT: () => {
          getDataUntil(DTInteger.name);
          this.CONSUME_WITH_RECOVERY(DTInteger);
        }
      }, // Integers
      {
        ALT: () => {
          getDataUntil(DTDecimal.name);
          this.CONSUME_WITH_RECOVERY(DTDecimal);
        }
      }, // Decimals
      {
        ALT: () => {
          getDataUntil(DTBooleano.name);
          this.CONSUME_WITH_RECOVERY(DTBooleano);
        }
      }, // Decimals
      {
        ALT: () => {
          getDataUntil(Iden.name);
          this.CONSUME_WITH_RECOVERY(Iden);
        }
      }, // Variables
      {
        ALT: () => {
          // Expresiones en paréntesis
          this.CONSUME_WITH_RECOVERY(ParLeft, { ERR_MSG: 'Se esperaba un (' });
          this.SUBRULE(this.expression);
          this.CONSUME_WITH_RECOVERY(ParRight, { ERR_MSG: 'Se esperaba un )' });
        }
      }
    ]);
    this.termCounter++;
  });
}

export const asignacionParser = new Parser();
