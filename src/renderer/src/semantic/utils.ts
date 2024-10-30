import { IRecognitionException, IToken } from 'chevrotain';
import {
  Begin,
  DTBooleano,
  End,
  EQ,
  GT,
  GTE,
  Iden,
  If,
  LT,
  LTE,
  NEQ,
  ParLeft,
  ParRight,
  Var,
  While,
  WhiteSpace
} from '@renderer/lexer/tokens';

export const getBeginEndAreBalanced = (tokens: IToken[]) => {
  const begin = tokens.filter((x) => x.tokenType === Begin);
  const end = tokens.filter((x) => x.tokenType === End);

  return {
    numBegin: begin.length,
    numEnd: end.length,
    areBalanced: begin.length === end.length
  };
};

export const getParenthesisAreBalanced = (tokens: IToken[]) => {
  const left = tokens.filter((x) => x.tokenType === ParLeft);
  const right = tokens.filter((x) => x.tokenType === ParRight);

  return {
    numLeft: left.length,
    numRight: right.length,
    areBalanced: left.length === right.length
  };
};

export const getVariablesDeclared = (tokensWhitespace: IToken[]) => {
  const tokens = tokensWhitespace.filter((x) => x.tokenType !== WhiteSpace);
  const errors: string[] = [];
  const variables = new Set<string>();

  // Variables declared
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === Var && tokens[i + 1]?.tokenType === Iden) {
      const next = tokens[i + 1];
      if (variables.has(next.image)) {
        errors.push(`Error: Variable ${next.image} ya ha sido declarada`);
      } else {
        variables.add(next.image);
      }
    }

    if (current.tokenType === Iden && tokens[i - 1].tokenType !== Var) {
      if (!variables.has(current.image)) {
        errors.push(
          `Variable "${current.image}" no ha sido declarada en la linea ${current.startLine}, columna ${current.startColumn}`
        );
      }
    }
  }
  return errors;
};

export const checkValidDataTypes = (tokens: IToken[]) => {
  // Datatype of while
  const errors: string[] = [];
  const editorErrors: IRecognitionException[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === While) {
      const tokensInsideWhile: IToken[] = [];
      for (let j = i + 2; j < tokens.length; j++) {
        const currentInside = tokens[j];
        if (currentInside.tokenType === ParRight) {
          break;
        }
        tokensInsideWhile.push(currentInside);
      }

      if (tokensInsideWhile.every((x) => !isRelationalOperator(x))) {
        const message = `Expresión dentro del while no resulta en booleana ${current.startLine}, columna ${current.startColumn}`;
        errors.push(message);
        editorErrors.push({
          message,
          token: tokens[i + 3],
          name: 'SemanticError',
          resyncedTokens: [],
          context: {} as any
        });
      }
    }
  }

  // Datatype of if
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === If) {
      const tokensInsideWhile: IToken[] = [];
      for (let j = i + 2; j < tokens.length; j++) {
        const currentInside = tokens[j];
        if (currentInside.tokenType === ParRight) {
          break;
        }
        tokensInsideWhile.push(currentInside);
      }
      if (tokensInsideWhile.every((x) => !isRelationalOperator(x))) {
        const message = `Expresión dentro del if no resulta en booleana ${current.startLine}, columna ${current.startColumn}`;
        errors.push(message);
        editorErrors.push({
          message,
          token: tokens[i + 3],
          name: 'SemanticError',
          resyncedTokens: [],
          context: {} as any
        });
      }
    }
  }

  return { errors, editorErrors };
};

const isRelationalOperator = (token: IToken) => {
  return [EQ, NEQ, GT, GTE, LT, LTE, DTBooleano].includes(token.tokenType);
};
