import { BeforeMount, Editor, Monaco, OnMount } from '@monaco-editor/react';
import '../config/config';
import { FC, useEffect, useRef } from 'react';
import { createMarkersFromErrors, useCodeStore } from '@renderer/context/codeContext';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import { Card } from 'antd';

const defaultCode = `iniciar
    var nombre = "Super Language";
    imprimir(1, "Bienvenido a ", nombre, "!");
    // esto es un comentario
    var sencilla = 5 + 10;
    var media = 5 + (10 * 2 / 2);
    var compleja = 5 + 10 * (2 / 2 - 5) < 10 / 3;
    var complejaDecimal = 5.5 + 10.5 * (2.5 / 2.5 - 5.5) < 10.5 / 3.5;

    // Error en sintaxis
    capturar numeroSecreto, "Prueba";

    var numeroSecreto;
    numeroSecreto = "";
    noDeclarada = "";
    var helloWorld = 450 + 50.5;
    var booleana = verdadero || falso;
    var adivinanza;
    capturar adivinanza;
    capturar numeroSecreto, helloWorld;

    // Bien en lexico pero error en semantico por tipo de dato
    mientras (20) iniciar

    finalizar

    // Bien en lexico pero error en semantico por tipo de dato
    si(helloWorld) iniciar
         imprimir("Hola");
    finalizar

    // Bien en lexico pero error en semantico por variable no declara
    si(noDeclarada2) iniciar
         imprimir("Hola");
    finalizar

    mientras (adivinanza != numeroSecreto) iniciar
        imprimir("Adivina el número (1-100):");
        // Simulando la entrada del usuario
        adivinanza = 50; // Aquí puedes cambiar el valor para simular diferentes intentos

        si (adivinanza < numeroSecreto) iniciar
            imprimir("El número es mayor.");
        finalizar
        sino si (adivinanza > numeroSecreto) iniciar
            imprimir("El número es menor.");
        finalizar
        sino iniciar
            imprimir("¡Felicidades! Has adivinado el número.");
        finalizar
    finalizar
finalizar
`;

const handleEditorWillMount: BeforeMount = (monaco) => {
  // Register a new language
  monaco?.languages.register({ id: 'super-language' });

  // Define the rules
  monaco?.languages.setMonarchTokensProvider('super-language', {
    keywords: [
      'iniciar',
      'finalizar',
      'si',
      'sino',
      'mientras',
      'para',
      'funcion',
      'regresar',
      'importar',
      'verdadero',
      'falso',
      'imprimir',
      'estructura',
      'var',
      'capturar'
    ],
    typeKeywords: ['nulo', 'entero', 'decimal', 'cadena', 'booleano', 'true', 'false'],
    operators: [
      ...['=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--'],
      ...['+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/='],
      ...['&=', '|=', '^=', '%=', '<<=', '>>=', '>>>=']
    ],
    symbols: /[=><!~?:&|+\-*\/^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    brackets: [
      { token: 'delimiter.curly', open: 'iniciar', close: 'finalizar' },
      { token: 'delimiter.parenthesis', open: '(', close: ')' },
      { token: 'delimiter.square', open: '[', close: ']' },
      { token: 'delimiter.angle', open: '<', close: '>' }
    ],
    tokenizer: {
      root: [
        // characters
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid'],
        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],
        // numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],
        // @ annotations.
        // As an example, we emit a debugging log message on these tokens.
        // Note: message are supressed during the first load -- change some lines to see them.
        [/@\s*[a-zA-Z_$][\w$]*/, { token: 'annotation', log: 'annotation token: $0' }],
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              '@typeKeywords': 'keyword',
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }
        ],
        [/[A-Z][\w$]*/, 'type.identifier'], // to show class names nicely
        // whitespace
        { include: '@whitespace' },
        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }]
      ],
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment']
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'], // nested comment
        ['\\*/', 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ]
    }
  });

  // Autocomplete
  monaco?.languages.registerCompletionItemProvider('super-language', {
    provideCompletionItems: function (model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions = [
        {
          label: 'iniciar',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'iniciar\n    $0\nfinalizar',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'finalizar',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'finalizar',
          range: range
        },
        {
          label: 'var',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'var ',
          range: range
        },
        {
          label: 'imprimir',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'imprimir($0);',
          range: range,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
      ];
      return { suggestions: suggestions };
    }
  });
};

type IProps = {
  onDidMount?: OnMount;
};

const MonacoEditor: FC<IProps> = ({ onDidMount }) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const setCode = useCodeStore((state) => state.setCode);
  const code = useCodeStore((state) => state.code);
  const errors = useCodeStore((state) => state.errors);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      monacoRef.current?.editor.setModelMarkers(editor.getModel()!, 'owner', createMarkersFromErrors(errors));
    }
  }, [errors]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    onDidMount?.(editor, monaco);
  };

  useEffect(() => setCode(defaultCode), []);
  const onChange = (value?: string) => setCode(value || '');

  return (
    <Card className={'shadow h-full'} classNames={{ body: 'h-full' }}>
      <Editor
        className={'h-full'}
        defaultLanguage="super-language"
        value={code}
        // defaultValue={code}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={onChange}
        theme={'vs'}
      />
    </Card>
  );
};

export default MonacoEditor;
