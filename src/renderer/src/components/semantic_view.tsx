import { createMarkersFromErrors, useCodeStore } from '@renderer/context/codeContext';
import { Card, Col, Row, Statistic, Tag } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import {
  checkValidDataTypes,
  getBeginEndAreBalanced,
  getParenthesisAreBalanced,
  getVariablesDeclared
} from '@renderer/semantic/utils';
import MonacoEditor from '@renderer/components/MonacoEditor';
import { Monaco, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import { uniqWith } from 'es-toolkit';

const SemanticView = () => {
  const originalTokens = useCodeStore((x) => x.originalTokens);
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const { numEnd, numBegin, areBalanced } = useMemo(() => getBeginEndAreBalanced(originalTokens), [originalTokens]);
  const parenBalanced = useMemo(() => getParenthesisAreBalanced(originalTokens), [originalTokens]);
  const errorsVar = useMemo(() => getVariablesDeclared(originalTokens), [originalTokens]);
  const { errors, editorErrors } = checkValidDataTypes(originalTokens);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const markers = monacoRef.current?.editor.getModelMarkers({}) ?? [];
      const uniqMarkers = uniqWith(markers, (item, item2) => {
        return item.startLineNumber === item2.startLineNumber && item.startColumn === item2.startColumn;
      });
      monacoRef.current?.editor.setModelMarkers(editor.getModel()!, 'owner', [
        ...uniqMarkers,
        ...createMarkersFromErrors(editorErrors)
      ]);
    }
  }, [editorErrors]);

  return (
    <div className={'grid grid-cols-2 h-full gap-x-3'}>
      <MonacoEditor onDidMount={handleEditorDidMount} />
      <div className={'overflow-y-scroll flex flex-col gap-y-3'}>
        {/*<p>Tipos de datos en operaciones aritmeticas sean compables</p>*/}

        <Card title={'Equilibro de iniciar y finalizar'} className={'shadow-lg'}>
          <Row gutter={16}>
            <Col>
              <Statistic title="Iniciar" value={numBegin} />
            </Col>
            <Col>
              <Statistic title="Finalizar" value={numEnd} />
            </Col>
          </Row>
          <Tag color={areBalanced ? 'green' : 'red'}>{areBalanced ? 'Equilibrado' : 'No equilibrado'}</Tag>
        </Card>
        <Card title={'Equilibro de paréntesis'} className={'shadow-lg'}>
          <Row gutter={16}>
            <Col>
              <Statistic title="Par izq. (" value={parenBalanced.numLeft} />
            </Col>
            <Col>
              <Statistic title="Par der. )" value={parenBalanced.numRight} />
            </Col>
          </Row>
          <Tag color={parenBalanced.areBalanced ? 'green' : 'red'}>
            {parenBalanced.areBalanced ? 'Equilibrado' : 'No equilibrado'}
          </Tag>
        </Card>
        <Card title={'Errores de variables no declaradas'} className={'shadow-lg'}>
          {[...errorsVar, ...errors].map((x, i) => (
            <Tag color={'red'} key={i} className={'mb-0.5'}>
              {x}
            </Tag>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default SemanticView;
