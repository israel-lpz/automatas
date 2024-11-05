import { IToken } from 'chevrotain';
import {
  Assign,
  Comma,
  Comment,
  DTBooleano,
  DTDecimal,
  DTInteger,
  DTString,
  Iden,
  Semi,
  Var,
  WhiteSpace
} from '../lexer/tokens'; // Ajusta la ruta según tu estructura de archivos

// Interfaz para representar una variable
export interface Variable {
  name: string;
  type: 'entero' | 'decimal' | 'booleano' | 'cadena' | 'desconocido';
  value: string | null;
}

// Mapeo de tokens de tipo a nombres legibles
const typeMap: { [key: string]: Variable['type'] } = {
  PR11: 'entero',
  PR12: 'decimal',
  PR13: 'booleano',
  PR14: 'cadena'
};

// Función para inferir el tipo de una expresión
// Función para inferir el tipo de una expresión
function inferExpressionType(
  tokens: IToken[],
  startIndex: number,
  endIndex: number,
  variablesContext: Map<string, Variable['type']>
): Variable['type'] {
  // Extraer los tokens relevantes de la expresión
  const expressionTokens = tokens.slice(startIndex, endIndex);

  // Crear una instancia del inferencer con el contexto de variables
  const inferer = new TypeInferer(expressionTokens, variablesContext);
  const inferredType = inferer.parse() as Variable['type'];

  return inferredType;
}

export function getVariables(tokensWhitespace: IToken[]): Variable[] {
  // Filtrar los tokens que no son espacios en blanco ni comentarios
  const tokens = tokensWhitespace.filter((x) => x.tokenType !== WhiteSpace && x.tokenType !== Comment);

  // Array para almacenar variables
  const variables: Variable[] = [];

  // Mapa para mantener el contexto de variables y sus tipos
  const variablesContext: Map<string, Variable['type']> = new Map();

  let i = 0;
  while (i < tokens.length) {
    const current = tokens[i];

    // Detectar la palabra clave 'var'
    if (current.tokenType === Var) {
      const nextToken = tokens[i + 1];

      if (nextToken && nextToken.tokenType === Iden) {
        const varName = nextToken.image;
        let varType: Variable['type'] = 'desconocido';
        let varValue: string | null = null;
        let newIndex = i + 2;

        // Verificar si hay un tipo explícito o una asignación
        if (tokens[newIndex] && typeMap.hasOwnProperty(tokens[newIndex].tokenType.name)) {
          // Caso 1: Declaración con tipo explícito
          varType = typeMap[tokens[newIndex].tokenType.name];
          variablesContext.set(varName, varType); // Actualizar el contexto
          newIndex += 1;

          // Verificar si hay una asignación después del tipo
          if (tokens[newIndex] && tokens[newIndex].tokenType === Assign) {
            const assignIndex = newIndex;
            const expressionStart = assignIndex + 1;

            // Encontrar el final de la expresión (por ejemplo, el punto y coma)
            let expressionEnd = expressionStart;
            while (expressionEnd < tokens.length && tokens[expressionEnd].tokenType !== Semi) {
              expressionEnd += 1;
            }

            // Extraer la expresión como cadena
            const expressionTokens = tokens.slice(expressionStart, expressionEnd);
            const expressionString = expressionTokens.map((token) => token.image).join(' ');
            varValue = expressionString;

            // Inferir el tipo de la expresión
            const inferredType: Variable['type'] = inferExpressionType(
              tokens,
              expressionStart,
              expressionEnd,
              variablesContext
            );
            if (inferredType !== 'desconocido') {
              varType = inferredType;
              variablesContext.set(varName, varType); // Actualizar el contexto con el tipo inferido
            }

            newIndex = expressionEnd + 1;
          }

          // Agregar la variable al array
          variables.push({
            name: varName,
            type: varType,
            value: varValue
          });

          // Manejar múltiples declaraciones separadas por comas
          while (tokens[newIndex] && tokens[newIndex].tokenType === Comma) {
            const subsequentIden = tokens[newIndex + 1];
            const subsequentTypeToken = tokens[newIndex + 2];
            if (
              subsequentIden &&
              subsequentIden.tokenType === Iden &&
              subsequentTypeToken &&
              typeMap.hasOwnProperty(subsequentTypeToken.tokenType.name)
            ) {
              const subsequentVarName = subsequentIden.image;
              const subsequentVarType = typeMap[subsequentTypeToken.tokenType.name];
              variables.push({
                name: subsequentVarName,
                type: subsequentVarType,
                value: null
              });
              variablesContext.set(subsequentVarName, subsequentVarType); // Actualizar el contexto
              newIndex += 3;
            } else {
              break;
            }
          }
        } else if (tokens[newIndex] && tokens[newIndex].tokenType === Assign) {
          // Caso 2: Declaración con asignación
          const assignIndex = newIndex;
          const expressionStart = assignIndex + 1;

          // Encontrar el final de la expresión (por ejemplo, el punto y coma)
          let expressionEnd = expressionStart;
          while (expressionEnd < tokens.length && tokens[expressionEnd].tokenType !== Semi) {
            expressionEnd += 1;
          }

          // Extraer la expresión como cadena
          const expressionTokens = tokens.slice(expressionStart, expressionEnd);
          const expressionString = expressionTokens.map((token) => token.image).join(' ');
          varValue = expressionString;

          // Inferir el tipo de la expresión
          varType = inferExpressionType(tokens, expressionStart, expressionEnd, variablesContext);
          variablesContext.set(varName, varType); // Actualizar el contexto

          newIndex = expressionEnd + 1;

          // Agregar la variable al array
          variables.push({
            name: varName,
            type: varType,
            value: varValue
          });
        } else {
          // Caso 3: Declaración sin tipo ni asignación
          variables.push({
            name: varName,
            type: varType, // 'desconocido'
            value: null
          });
          variablesContext.set(varName, varType); // Actualizar el contexto
        }

        // Avanzar el índice
        i = newIndex;
        continue;
      }
    }

    // Manejar asignaciones posteriores a la declaración
    if (current.tokenType === Iden && tokens[i + 1]?.tokenType === Assign) {
      const varName = current.image;
      const assignIndex = i + 1;
      const expressionStart = assignIndex + 1;

      // Encontrar el final de la expresión (por ejemplo, el punto y coma)
      let expressionEnd = expressionStart;
      while (expressionEnd < tokens.length && tokens[expressionEnd].tokenType !== Semi) {
        expressionEnd += 1;
      }

      // Extraer la expresión como cadena
      const expressionTokens = tokens.slice(expressionStart, expressionEnd);
      const expressionString = expressionTokens.map((token) => token.image).join(' ');
      const exprType = inferExpressionType(tokens, expressionStart, expressionEnd, variablesContext);

      // Buscar si la variable ya existe en el array
      const variable = variables.find((v) => v.name === varName);
      if (variable) {
        // Actualizar el tipo si es desconocido
        if (variable.type === 'desconocido' && exprType !== 'desconocido') {
          variable.type = exprType;
          variablesContext.set(varName, exprType); // Actualizar el contexto
        }
        // Actualizar el valor
        variable.value = expressionString;
      } else {
        // Si la variable no fue declarada previamente, agregarla
        variables.push({
          name: varName,
          type: exprType,
          value: expressionString
        });
        variablesContext.set(varName, exprType); // Actualizar el contexto
      }

      // Avanzar el índice
      i = expressionEnd + 1;
      continue;
    }

    // Incrementar el índice si no se ha procesado ningún token especial
    i += 1;
  }

  return variables;
}

class TypeInferer {
  private tokens: IToken[];
  private position: number;
  private variables: Map<string, string>; // Contexto de variables con sus tipos

  constructor(tokens: IToken[], variables: Map<string, string>) {
    this.tokens = tokens;
    this.position = 0;
    this.variables = variables;
  }

  public parse(): string {
    const type = this.parseLogicalOr();
    return type;
  }

  // Nivel 1: Operadores lógicos OR (||)
  private parseLogicalOr(): string {
    let leftType = this.parseLogicalAnd();
    while (this.match('||')) {
      const operator = this.currentToken().image;
      this.position++;
      const rightType = this.parseLogicalAnd();
      leftType = this.combineTypes(leftType, operator, rightType);
    }
    return leftType;
  }

  // Nivel 2: Operadores lógicos AND (&&)
  private parseLogicalAnd(): string {
    let leftType = this.parseEquality();
    while (this.match('&&')) {
      const operator = this.currentToken().image;
      this.position++;
      const rightType = this.parseEquality();
      leftType = this.combineTypes(leftType, operator, rightType);
    }
    return leftType;
  }

  // Nivel 3: Operadores de igualdad (==, !=)
  private parseEquality(): string {
    let leftType = this.parseRelational();
    while (this.match('==') || this.match('!=')) {
      const operator = this.currentToken().image;
      this.position++;
      const rightType = this.parseRelational();
      leftType = this.combineTypes(leftType, operator, rightType);
    }
    return leftType;
  }

  // Nivel 4: Operadores relacionales (<, >, <=, >=)
  private parseRelational(): string {
    let leftType = this.parseAdditive();
    while (this.match('<') || this.match('>') || this.match('<=') || this.match('>=')) {
      this.position++;
      this.parseAdditive();
      // Las operaciones relacionales siempre retornan booleano
      leftType = 'booleano';
    }
    return leftType;
  }

  // Nivel 5: Operadores aditivos (+, -)
  private parseAdditive(): string {
    let leftType = this.parseMultiplicative();
    while (this.match('+') || this.match('-')) {
      const operator = this.currentToken()!.image;
      this.position++;
      const rightType = this.parseMultiplicative();
      leftType = this.combineTypes(leftType, operator, rightType);
    }
    return leftType;
  }

  // Nivel 6: Operadores multiplicativos (*, /, %)
  private parseMultiplicative(): string {
    let leftType = this.parseUnary();
    while (this.match('*') || this.match('/') || this.match('%')) {
      const operator = this.currentToken()!.image;
      this.position++;
      const rightType = this.parseUnary();
      leftType = this.combineTypes(leftType, operator, rightType);
    }
    return leftType;
  }

  // Nivel 7: Operadores unarios (!, -)
  private parseUnary(): string {
    if (this.match('!') || this.match('-')) {
      const operator = this.currentToken()!.image;
      this.position++;
      const operandType = this.parseUnary();
      // Definir la lógica para operadores unarios si es necesario
      // Por simplicidad, asumiremos que ! siempre retorna booleano y - mantiene el tipo numérico
      if (operator === '!') {
        return 'booleano';
      } else if (operator === '-') {
        return operandType;
      }
    }
    return this.parsePrimary();
  }

  // Nivel 8: Operadores primarios (literales, variables, paréntesis)
  private parsePrimary(): string {
    const token = this.currentToken()!;

    if (this.match('(')) {
      this.position++; // Consumir '('
      const type = this.parseLogicalOr();
      if (this.match(')')) {
        this.position++; // Consumir ')'
      } else {
        // Manejo de error: se esperaba ')'
        console.warn(`Se esperaba ')' en posición ${this.position}`);
      }
      return type;
    } else if (this.isLiteral(token)) {
      const type = this.getLiteralType(token);
      this.position++;
      return type;
    } else if (this.match(Iden)) {
      // Si es un identificador, buscar su tipo en el contexto
      const varName = token.image;
      const varType = this.variables.get(varName) || 'desconocido';
      this.position++;
      return varType;
    } else {
      // Token desconocido
      console.warn(`Token desconocido: ${token.image} en posición ${this.position}`);
      this.position++;
      return 'desconocido';
    }
  }

  // Combina tipos basados en el operador
  private combineTypes(left: string, operator: string, right: string): string {
    if (['+', '-', '*', '/', '%'].includes(operator)) {
      if (left === 'decimal' || right === 'decimal') return 'decimal';
      if (left === 'entero' && right === 'entero') return 'entero';
      return 'desconocido';
    }
    if (['&&', '||'].includes(operator)) {
      if (left === 'booleano' && right === 'booleano') return 'booleano';
      return 'desconocido';
    }
    // Otros operadores pueden ser manejados aquí
    return 'desconocido';
  }

  // Verifica si el token actual coincide con el valor dado
  private match(value: string | any): boolean {
    const token = this.currentToken();
    if (!token) return false;
    if (typeof value === 'string') {
      return token.image === value;
    }
    // Si value es un tipo de token, verificar la igualdad
    return token.tokenType === value;
  }

  // Verifica si el token es un literal
  private isLiteral(token: IToken): boolean {
    return [DTInteger, DTDecimal, DTBooleano, DTString].includes(token.tokenType);
  }

  // Obtiene el tipo del literal
  private getLiteralType(token: IToken): string {
    switch (token.tokenType) {
      case DTInteger:
        return 'entero';
      case DTDecimal:
        return 'decimal';
      case DTBooleano:
        return 'booleano';
      case DTString:
        return 'cadena';
      default:
        return 'desconocido';
    }
  }

  // Obtiene el token actual
  private currentToken(): IToken {
    return this.tokens[this.position]!;
  }
}
