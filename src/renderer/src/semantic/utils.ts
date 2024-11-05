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
import { getVariables } from '@renderer/semantic/getVariables';

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
  const editorErrors: IRecognitionException[] = [];

  // Variables declared
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === Var && tokens[i + 1]?.tokenType === Iden) {
      const next = tokens[i + 1];
      if (variables.has(next.image)) {
        const message = `Error: Variable ${next.image} ya ha sido declarada`;
        errors.push(message);
        editorErrors.push(createSemanticError(message, tokens[i + 3]));
      } else {
        variables.add(next.image);
      }
    }

    if (current.tokenType === Iden && tokens[i - 1]?.tokenType !== Var) {
      if (!variables.has(current.image)) {
        const message = `Variable "${current.image}" no ha sido declarada en la linea ${current.startLine}, columna ${current.startColumn}`;
        errors.push(message);
        editorErrors.push(createSemanticError(message, current));
      }
    }
  }
  console.log({ errors, editorErrors });

  return { errors, editorErrors };
};

export const checkValidDataTypes = (tokens: IToken[]) => {
  // Datatype of while
  const errors: string[] = [];
  const editorErrors: IRecognitionException[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === While) {
      const variables = getVariables(tokens.slice(0, i));

      const tokensInsideWhile: IToken[] = [];
      for (let j = i + 2; j < tokens.length; j++) {
        const currentInside = tokens[j];
        if (currentInside.tokenType === ParRight) {
          break;
        }
        tokensInsideWhile.push(currentInside);
      }

      if (tokensInsideWhile.length === 1 && tokensInsideWhile[0].tokenType === Iden) {
        const variable = variables.find((x) => x.name === tokensInsideWhile[0].image);
        if (variable) {
          if (variable.type !== 'booleano') {
            const message = `Expresión dentro del while no resulta en booleana \nlinea ${current.startLine}, columna ${current.startColumn}`;
            errors.push(message);
            editorErrors.push(createSemanticError(message, tokens[i + 3]));
            continue;
          }
        } else {
          // const message = `Variable ${tokensInsideWhile[0].image} no ha sido declarada \nlinea ${current.startLine}, columna ${current.startColumn}`;
          // errors.push(message);
          // editorErrors.push(createSemanticError(message, tokens[i + 3]));
          continue;
        }
      }

      if (tokensInsideWhile.every((x) => !isRelationalOperator(x))) {
        const message = `Expresión dentro del while no resulta en booleana \nlinea ${current.startLine}, columna ${current.startColumn}`;
        errors.push(message);
        editorErrors.push(createSemanticError(message, tokens[i + 3]));
      }
    }
  }

  // Datatype of if
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (current.tokenType === If) {
      const tokensInsideIf: IToken[] = [];
      for (let j = i + 2; j < tokens.length; j++) {
        const currentInside = tokens[j];
        if (currentInside.tokenType === ParRight) {
          break;
        }
        tokensInsideIf.push(currentInside);
      }
      const variables = getVariables(tokens.slice(0, i));

      if (tokensInsideIf.length === 1 && tokensInsideIf[0].tokenType === Iden) {
        const variable = variables.find((x) => x.name === tokensInsideIf[0].image);
        if (variable) {
          if (variable.type !== 'booleano') {
            const message = `Expresión dentro del while no resulta en booleana \nlinea ${current.startLine}, columna ${current.startColumn}`;
            errors.push(message);
            editorErrors.push(createSemanticError(message, tokens[i + 3]));
            continue;
          }
        } else {
          // const message = `Variable ${tokensInsideIf[0].image} no ha sido declarada \nlinea ${current.startLine}, columna ${current.startColumn}`;
          // errors.push(message);
          // editorErrors.push(createSemanticError(message, tokens[i + 3]));
          continue;
        }
      }

      if (tokensInsideIf.every((x) => !isRelationalOperator(x))) {
        const message = `Expresión dentro del if no resulta en booleana \nlinea ${current.startLine}, columna ${current.startColumn}`;
        errors.push(message);
        editorErrors.push(createSemanticError(message, tokens[i + 3]));
      }
    }
  }

  return { errors, editorErrors };
};

function createSemanticError(message: string, token: IToken) {
  return {
    message,
    token,
    name: 'SemanticError',
    resyncedTokens: [],
    context: {} as any
  };
}

//  // const expresion: IToken[] = [];
//       // for (let j = i + 4; j < tokens.length; j++) {
//       //   const currentInside = tokens[j];
//       //   if (currentInside.tokenType === Semi) {
//       //     break;
//       //   }
//       //   expresion.push(currentInside);
//       // }
//       // if (expresion.length === 0) {
//       //   variables.set(next.image, {
//       //     name: next.image,
//       //     value: next3.image,
//       //     type: next3.tokenType.name
//       //   });
//       // } else if (expresion.length > 1) {
//       //   const expresionString = expresion.map((x) => x.image).join(' ');
//       //   let type = 'expresion';
//       //   if (expresion.some((x) => isRelationalOperator(x))) {
//       //     type = 'boolean';
//       //   } else if (expresion.some((x) => x.tokenType === DTDecimal)) {
//       //     type = 'decimal';
//       //   } else if (expresion.some((x) => x.tokenType === DTInteger)) {
//       //     type = 'entero';
//       //   }
//       //   variables.set(next.image, {
//       //     name: next.image,
//       //     value: expresionString,
//       //     type
//       //   });
//       // } else {
//       //   variables.set(next.image, {
//       //     name: next.image,
//       //     value: 'nulo',
//       //     type: 'nulo'
//       //   });
//       // }

// function getExpresion(tokens: IToken[], i: number, variables: Map<string, IVariables>) {
//   const expresion: IToken[] = [];
//   for (let j = i + 4; j < tokens.length; j++) {
//     const currentInside = tokens[j];
//     if (currentInside.tokenType === Semi) {
//       break;
//     }
//     expresion.push(currentInside);
//   }
//
//   const next = tokens[i + 1]; // Iden
//   // const next2 = tokens[i + 2]; // =
//   const next3 = tokens[i + 3]; // Value
//
//   if (expresion.length === 0) {
//     return next3.tokenType.name
//   } else if (expresion.length > 1) {
//     let type = 'expresion';
//     if (expresion.some((x) => isRelationalOperator(x))) {
//       type = 'boolean';
//     } else if (expresion.some((x) => x.tokenType === DTDecimal)) {
//       type = 'decimal';
//     } else if (expresion.some((x) => x.tokenType === DTInteger)) {
//       type = 'entero';
//     }
//     return type;
//
//   } else {
//     return 'nulo';
//   }
//
// }

const isRelationalOperator = (token: IToken) => {
  return [EQ, NEQ, GT, GTE, LT, LTE, DTBooleano].includes(token.tokenType);
};
