import { CstParser } from 'chevrotain';
import {
  allTokens,
  End,
  Begin,
  Var,
  Iden,
  Assign,
  DTInteger,
  DTString,
  DTDecimal,
  DTBooleano,
  Semi,
  If,
  Else,
  Print,
  ParLeft,
  ParRight,
  Comma,
  Comment,
  While,
  Add,
  Minus,
  Mul,
  Div,
  EQ,
  NEQ,
  GT,
  GTE,
  LT,
  LTE,
  Mod,
  Or,
  Capturar
} from './tokens';

class Parser extends CstParser {
  constructor() {
    super(allTokens, {
      maxLookahead: 5
    });
    this.performSelfAnalysis();
  }

  block = this.RULE('block', () => {
    this.CONSUME(Begin, { ERR_MSG: 'Se esperaba la palabra reservada "iniciar"' });
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(End, { ERR_MSG: 'Se esperaba la palabra reservada "finalizar"' });
  });

  statement = this.RULE('statement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.declarationOrAssignment) },
      { ALT: () => this.SUBRULE(this.assignment) },
      // { ALT: () => this.SUBRULE(this.declarationOrAssignment) },
      { ALT: () => this.SUBRULE(this.ifStatement) },
      { ALT: () => this.SUBRULE(this.whileStatement) },
      { ALT: () => this.SUBRULE(this.printStatement) },
      { ALT: () => this.SUBRULE(this.capturarStatement) },
      { ALT: () => this.CONSUME(Comment) }
    ]);
  });

  // varDeclaration = this.RULE('varDeclaration', () => {
  //   this.CONSUME(Var, { ERR_MSG: 'Se esperaba la palabra reservada "var"' });
  //   this.CONSUME(Iden, { ERR_MSG: 'Se esperaba un identificador' });
  //   this.CONSUME(Semi, { ERR_MSG: 'Se esperaba ;' });
  // });

  declarationOrAssignment = this.RULE('declarationOrAssignment', () => {
    this.CONSUME(Var, { ERR_MSG: 'Se esperaba la palabra reservada "var"' });
    this.CONSUME(Iden, { ERR_MSG: 'Se esperaba un identificador' });
    this.OPTION(() => {
      this.CONSUME(Assign, { ERR_MSG: 'Se esperaba =' });
      this.OR1([
        { ALT: () => this.CONSUME(DTString) },
        { ALT: () => this.SUBRULE(this.expression) }
        //
      ]);
    });
    this.CONSUME(Semi, { ERR_MSG: 'Se esperaba ;' });
  });

  assignment = this.RULE('assignment', () => {
    this.CONSUME(Iden, { ERR_MSG: 'Se esperaba un identificador' });
    this.CONSUME(Assign, { ERR_MSG: 'Se esperaba =' });
    this.OR1([
      { ALT: () => this.CONSUME(DTString) },
      { ALT: () => this.SUBRULE(this.expression) }
      //
    ]);
    this.CONSUME(Semi, { ERR_MSG: 'Se esperaba ;' });
  });

  ifStatement = this.RULE('ifStatement', () => {
    this.CONSUME(If, { ERR_MSG: 'Se esperaba la palabra reservada "si"' });
    this.CONSUME(ParLeft, { ERR_MSG: 'Se esperaba (' });
    this.SUBRULE(this.expression);
    this.CONSUME(ParRight, { ERR_MSG: 'Se esperaba )' });
    this.SUBRULE(this.block);

    this.OPTION(() => {
      this.CONSUME(Else, { ERR_MSG: 'Se esperaba la palabra reservada "sino"' });
      this.SUBRULE(this.ifStatement);
    });

    this.OPTION1(() => {
      this.CONSUME2(Else, { ERR_MSG: 'Se esperaba la palabra reservada "sino"' });
      this.SUBRULE2(this.block);
    });
  });

  printStatement = this.RULE('printStatement', () => {
    this.CONSUME(Print, { ERR_MSG: 'Se esperaba la palabra reservada "imprimir"' });
    this.CONSUME(ParLeft, { ERR_MSG: 'Se esperaba un paréntesis izquierdo' });
    this.SUBRULE(this.allDataTypes);
    this.MANY(() => {
      this.CONSUME(Comma, { ERR_MSG: 'Se esperaba ","' });
      this.SUBRULE1(this.allDataTypes);
    });
    this.CONSUME(ParRight, { ERR_MSG: 'Se esperaba un (' });
    this.CONSUME(Semi, { ERR_MSG: 'Se esperaba un ;' });
  });

  whileStatement = this.RULE('whileStatement', () => {
    this.CONSUME(While, { ERR_MSG: 'Se esperaba la palabra reservada "mientras"' });
    this.CONSUME(ParLeft, { ERR_MSG: 'Se esperaba un (' });
    this.SUBRULE(this.expression);
    // this.OR([{ ALT: () => this.SUBRULE(this.booleanExpression) }]);
    this.CONSUME(ParRight, { ERR_MSG: 'Se esperaba un )' });
    this.SUBRULE(this.block);
  });

  capturarStatement = this.RULE('capturarStatement', () => {
    this.CONSUME(Capturar, { ERR_MSG: 'Se esperaba la palabra reservada "capturar"' });
    // this.CONSUME(ParLeft, { ERR_MSG: 'Se esperaba un (' });
    this.CONSUME(Iden);
    this.MANY(() => {
      this.CONSUME(Comma, { ERR_MSG: 'Se esperaba ","' });
      this.CONSUME2(Iden);
    });
    // this.CONSUME(ParRight, { ERR_MSG: 'Se esperaba un )' });
    this.CONSUME(Semi, { ERR_MSG: 'Se esperaba un ;' });
  });

  //
  //
  //
  //
  //
  // Regla principal para expresiones
  expression = this.RULE('expression', () => {
    this.OR([{ ALT: () => this.SUBRULE(this.comparisonExpression) }]);
  });

  // Regla para expresiones de comparación
  comparisonExpression = this.RULE('comparisonExpression', () => {
    this.SUBRULE(this.additiveExpression); // Inicia con la expresión aditiva
    this.MANY(() => {
      // Controles de múltiples comparaciones (ej. a < b < c)
      this.OR([
        {
          ALT: () => {
            this.CONSUME(EQ, { ERR_MSG: 'Se esperaba un =' });
            this.SUBRULE2(this.additiveExpression); // Uso de SUBRULE2 para diferenciación
          }
        },
        {
          ALT: () => {
            this.CONSUME(NEQ, { ERR_MSG: 'Se esperaba un !=' });
            this.SUBRULE3(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(GT, { ERR_MSG: 'Se esperaba un >' });
            this.SUBRULE4(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(GTE, { ERR_MSG: 'Se esperaba un >=' });
            this.SUBRULE5(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(LT, { ERR_MSG: 'Se esperaba un <' });
            this.SUBRULE6(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(LTE, { ERR_MSG: 'Se esperaba un <=' });
            this.SUBRULE7(this.additiveExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Or, { ERR_MSG: 'Se esperaba un ||' });
            this.SUBRULE8(this.additiveExpression);
          }
        }
      ]);
    });
  });

  // Regla para expresiones aditivas
  additiveExpression = this.RULE('additiveExpression', () => {
    this.SUBRULE(this.multiplicativeExpression); // Inicio con multiplicativas
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Add, { ERR_MSG: 'Se esperaba un +' });
            this.SUBRULE2(this.multiplicativeExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Minus, { ERR_MSG: 'Se esperaba un -' });
            this.SUBRULE3(this.multiplicativeExpression);
          }
        }
      ]);
    });
  });

  // Regla para expresiones multiplicativas
  multiplicativeExpression = this.RULE('multiplicativeExpression', () => {
    this.SUBRULE(this.primaryExpression); // Inicio con expresiones primarias
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Mul, { ERR_MSG: 'Se esperaba un *' });
            this.SUBRULE2(this.primaryExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Div, { ERR_MSG: 'Se esperaba un /' });
            this.SUBRULE3(this.primaryExpression);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Mod, { ERR_MSG: 'Se esperaba un %' });
            this.SUBRULE4(this.primaryExpression);
          }
        }
      ]);
    });
  });

  // Regla para expresiones primarias
  primaryExpression = this.RULE('primaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(DTDecimal) }, // Decimals
      { ALT: () => this.CONSUME(DTInteger) }, // Integers
      { ALT: () => this.CONSUME(DTBooleano) }, // Decimals
      { ALT: () => this.CONSUME(Iden) }, // Variables
      {
        ALT: () => {
          // Expresiones en paréntesis
          this.CONSUME(ParLeft, { ERR_MSG: 'Se esperaba un (' });
          this.SUBRULE(this.expression);
          this.CONSUME(ParRight, { ERR_MSG: 'Se esperaba un )' });
        }
      }
    ]);
  });

  mathOperator = this.RULE('mathOperator', () => {
    this.OR([
      { ALT: () => this.CONSUME(Add) },
      { ALT: () => this.CONSUME(Minus) },
      { ALT: () => this.CONSUME(Mul) },
      { ALT: () => this.CONSUME(Div) }
    ]);
  });

  relationalOperator = this.RULE('relationalOperator', () => {
    this.OR([
      { ALT: () => this.CONSUME(EQ) },
      { ALT: () => this.CONSUME(NEQ) },
      { ALT: () => this.CONSUME(GT) },
      { ALT: () => this.CONSUME(GTE) },
      { ALT: () => this.CONSUME(LT) },
      { ALT: () => this.CONSUME(LTE) }
    ]);
  });

  allDataTypes = this.RULE('allDataTypes', () => {
    this.OR([
      { ALT: () => this.CONSUME(DTInteger) },
      { ALT: () => this.CONSUME(DTDecimal) },
      { ALT: () => this.CONSUME(DTString) },
      { ALT: () => this.CONSUME(DTBooleano) },
      { ALT: () => this.CONSUME(Iden) }
    ]);
  });
}

export const customParser = new Parser();
// customParser.maxLookahead = 2;
