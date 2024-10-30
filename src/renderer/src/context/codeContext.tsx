import { create } from 'zustand/react';
import { customParser } from '@renderer/lexer/lexer';
import { Assign, customLexer, Iden, Semi, Var, WhiteSpace } from '@renderer/lexer/tokens';
import { IRecognitionException, IToken, TokenType } from 'chevrotain';
import { MarkerSeverity } from 'monaco-editor';

export type ICodeStore = {
  code: string;
  transformedCode: string;
  setCode: (code: string) => void;
  errors: IRecognitionException[];
  variables: IVariables[];
  originalTokens: IToken[];
};

export type IVariables = {
  name: string;
  type: string;
  value: string;
};

export const useCodeStore = create<ICodeStore>((setState) => ({
  code: '',
  transformedCode: '',
  errors: [],
  variables: [],
  originalTokens: [],
  setCode: (code: string) => {
    if (code === '') {
      setState({ code, errors: [], transformedCode: '', variables: [] });
      return;
    }

    const tokenize = customLexer.tokenize(code);
    const tokensWhitespace = tokenize.tokens;
    const tokens = tokensWhitespace.filter((token) => token.tokenType.name !== WhiteSpace.name);
    customParser.input = tokens;
    customParser.block();

    const transformedCode = getCodeTransformed(tokensWhitespace);
    const variables = obtenerVariables(tokens);

    setState({ code, errors: customParser.errors, transformedCode, variables, originalTokens: tokensWhitespace });
  }
}));

const getCodeTransformed = (tokens: IToken[]) => {
  let transformed = '';
  tokens.forEach((token) => {
    transformed += token.tokenType.name === 'WhiteSpace' ? token.image : token.tokenType.name;
    if (transformed.at(-1) !== ' ') {
      transformed += ' ';
    }
  });
  return transformed;
};

const obtenerVariables = (tokens: IToken[]) => {
  const variables = new Map<string, IVariables>();

  for (let x = 0; x < tokens.length; x++) {
    const current = tokens[x]; // var;
    const next = tokens[x + 1]; // IDEN;
    const next2 = tokens[x + 2]; // =;
    const next3 = tokens[x + 3]; // DT;
    const next4 = tokens[x + 4]; // ;

    if (eqT(current.tokenType, Var)) {
      if (eqT(next.tokenType, Iden) && eqT(next2.tokenType, Assign)) {
        if (next4.tokenType != Semi) {
          // Encontrar valores hasta el punto y coma
          let value = '';
          for (let i = x + 3; i < tokens.length; i++) {
            const token = tokens[i];
            if (eqT(token.tokenType, Semi)) break;
            value += token.image;
          }
          variables.set(next.image, { name: next.image, type: 'expresión', value });
        } else {
          variables.set(next.image, { name: next.image, type: next3.tokenType.name, value: next3.image });
        }
      }
      if (eqT(next.tokenType, Iden) && !eqT(next2.tokenType, Assign)) {
        variables.set(next.image, { name: next.image, type: 'null', value: 'null' });
      }
    }
  }

  return [...variables.values()];
};

const eqT = (token: TokenType, token2: TokenType) => {
  return token.name === token2.name;
};

// Mapeo de errores
export const createMarkersFromErrors = (errors: IRecognitionException[]) =>
  errors.map((error) => {
    return {
      startLineNumber: error.token.startLine ?? 0,
      startColumn: error.token.startColumn ?? 0,
      endLineNumber: error.token.endLine ?? 0,
      endColumn: error.token.endColumn ?? 0,
      message: error.message,
      severity: MarkerSeverity.Error
    };
  });
