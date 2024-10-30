import { Begin, Capturar, End, Iden, Print, Var } from '@renderer/lexer/tokens';
import { capturarParser } from '@renderer/lexer/parts/capturar';
import { createSyntaxDiagramsCode, CstParser, IToken } from 'chevrotain';
import { inicioParser } from '@renderer/lexer/parts/inicio';
import { PartParser } from '@renderer/lexer/parts/template';
import { endParser } from '@renderer/lexer/parts/finalizar';
import { printParser } from '@renderer/lexer/parts/imprimir';
import { asignacionParser } from '@renderer/lexer/parts/asignacion';
import { customParser } from '@renderer/lexer/lexer';

export const allParsers = {
  [Capturar.name]: (tokens: IToken[]) => evaluateParser(capturarParser, tokens),
  [Begin.name]: (tokens: IToken[]) => evaluateParser(inicioParser, tokens),
  [End.name]: (tokens: IToken[]) => evaluateParser(endParser, tokens),
  [Print.name]: (tokens: IToken[]) => evaluateParser(printParser, tokens),
  [Var.name]: (tokens: IToken[]) => evaluateParser(asignacionParser, tokens),
  [Iden.name]: (tokens: IToken[]) => evaluateParser(asignacionParser, tokens)
};

const evaluateParser = (parser: PartParser, tokens: IToken[]) => {
  parser.input = tokens;
  parser.steps = [];
  parser.errorLog = [];

  parser.evaluar();

  parser.errorLog.forEach((error) => {
    parser.steps.push(error);
  });
  if (parser.errorLog.length === 0) {
    parser.errors.forEach((error) => {
      parser.steps.push(error.message);
    });
  }

  const isValid = parser.errors.length === 0 && parser.errorLog.length === 0;
  if (isValid) {
    parser.steps.push('La linea es válida ✓');
  }

  return {
    html: getHTML(customParser),
    errors: parser.errors,
    steps: parser.steps,
    isValid
  };
};

const getHTML = (parser: CstParser) => {
  const serialziedGrammar = parser.getSerializedGastProductions();
  const htmlText = createSyntaxDiagramsCode(serialziedGrammar);
  return 'data:text/html;charset=utf-8,' + encodeURI(htmlText);
};
