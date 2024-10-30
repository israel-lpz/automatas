import { createToken, Lexer } from 'chevrotain';

// export const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
export const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/ });
// Mathematical Operators
export const Add = createToken({ name: 'OP1', pattern: /\+/, label: '+' });
export const Minus = createToken({ name: 'OP2', pattern: /-/, label: '-' });
export const Mul = createToken({ name: 'OP3', pattern: /\*/, label: '*' });
export const Div = createToken({ name: 'OP4', pattern: /\//, label: '/' });
export const Mod = createToken({ name: 'OP5', pattern: /%/, label: '/' });

// Logical Operators
export const And = createToken({ name: 'OPL1', pattern: /&&/, label: '&&' });
export const Or = createToken({ name: 'OPL2', pattern: /\|\|/, label: '||' });
export const Not = createToken({ name: 'OPL3', pattern: /!/, label: '!' });

// Relational Operators
export const EQ = createToken({ name: 'OPR1', pattern: /==/, label: '==' });
export const NEQ = createToken({ name: 'OPR6', pattern: /!=/, label: '!=' });
export const GT = createToken({ name: 'OPR2', pattern: />/, label: '>' });
export const GTE = createToken({ name: 'OPR4', pattern: />=/, label: '>=' });
export const LT = createToken({ name: 'OPR3', pattern: /</, label: '<' });
export const LTE = createToken({ name: 'OPR5', pattern: /<=/, label: '<=' });

// Keywords
export const Comment = createToken({ name: 'PR1', pattern: /\/\/.*|\/\*[\s\S]*?\*\//, group: Lexer.SKIPPED });
export const If = createToken({ name: 'PR2', pattern: /si/, label: 'si' });
export const Else = createToken({ name: 'PR3', pattern: /sino/, label: 'sino' });
export const While = createToken({ name: 'PR4', pattern: /mientras/, label: 'mientras' });
export const For = createToken({ name: 'PR5', pattern: /para/, label: 'para' });
export const Regresar = createToken({ name: 'PR6', pattern: /regresar/, label: 'regresar' });
export const Begin = createToken({ name: 'PR7', pattern: /iniciar/, label: 'iniciar' });
export const End = createToken({ name: 'PR8', pattern: /finalizar/, label: 'finalizar' });
export const Var = createToken({ name: 'PR9', pattern: /var/, label: 'var' });
export const Print = createToken({ name: 'PR10', pattern: /imprimir/, label: 'imprimir' });
export const Integer = createToken({ name: 'PR11', pattern: /entero/, label: 'entero' });
export const Decimal = createToken({ name: 'PR12', pattern: /decimal/, label: 'decimal' });
export const Booleano = createToken({ name: 'PR13', pattern: /booleano/, label: 'booleano' });
export const String = createToken({ name: 'PR14', pattern: /cadena/, label: 'cadena' });
// export const Null = createToken({ name: '', pattern: /nulo/, label: 'nulo' });
export const Capturar = createToken({ name: 'PR16', pattern: /capturar/, label: 'capturar' });

// Special Characters
export const ParLeft = createToken({ name: 'CE1', pattern: /\(/, label: '(' });
export const ParRight = createToken({ name: 'CE2', pattern: /\)/, label: ')' });
export const BraceLeft = createToken({ name: 'CE3', pattern: /\{/, label: '{' });
export const BraceRight = createToken({ name: 'CE4', pattern: /}/, label: '}' });
export const Semi = createToken({ name: 'CE5', pattern: /;/, label: ';' });
// export const Escape = createToken({ name: 'CE5', pattern: /;/, label: ';' });
export const Colon = createToken({ name: 'CE7', pattern: /:/, label: ':' });
export const Assign = createToken({ name: 'CE8', pattern: /=/, label: '=' });
export const Comma = createToken({ name: 'CE9', pattern: /,/, label: ',' });

// DataTypes
export const DTInteger = createToken({ name: 'CNE', pattern: /-?\d+/ });
export const DTDecimal = createToken({ name: 'CNR', pattern: /-?\d+\.\d+/ });
export const DTBooleano = createToken({ name: 'CBL', pattern: /true|false/ });
export const DTString = createToken({ name: 'CAD', pattern: /"([^"]*)"/ });

// Others...
export const Iden = createToken({ name: 'IDEN', pattern: /[a-zA-Z_$][a-zA-Z0-9_$]*/ });
export const IllegalToken = createToken({
  name: 'Illegal',
  pattern: /.+/ // Captura cualquier carácter que no sea un token válido
});

export const allTokens = [
  ...[WhiteSpace, Comment, Add, Minus, Mul, Div, Mod, And, Or, NEQ, Not, EQ, Assign, GTE, GT, LTE, LT, Else],
  ...[If, While, For, Regresar, Begin, End, Var, Print, Integer, Decimal, Booleano, String, Capturar],
  ...[ParLeft, ParRight, BraceLeft, BraceRight, Semi, Colon, Comma, DTDecimal, DTInteger, DTBooleano, DTString],
  ...[Iden],
  IllegalToken
];

export const customLexer = new Lexer(allTokens);
