import { useCodeStore } from '@renderer/context/codeContext';
import { IToken } from 'chevrotain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WhiteSpace } from '@renderer/lexer/tokens';
import { Table } from 'antd';
import { allParsers } from '@renderer/lexer/parts/all';
import { Check, X } from 'lucide-react';

const getCodePerLine = (tokens: IToken[]) => {
  const tokensPerLine = new Map<number, IToken[]>();
  for (let x = 0; x < tokens.length; x++) {
    const current = tokens[x];
    if (current.tokenType !== WhiteSpace) {
      const line = tokensPerLine.get(current.startLine!) ?? [];
      tokensPerLine.set(current.startLine!, [...line, current]);
    }
  }
  return [...tokensPerLine.values()];
};

const SyntacticView = () => {
  // const transformedCode = useCodeStore((state) => state.transformedCode);
  const originalTokens = useCodeStore((state) => state.originalTokens);
  const tokensPerLine = useMemo(() => getCodePerLine(originalTokens), [originalTokens]);
  const [activeTokens, setActiveTokens] = useState<IToken[]>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<number>();
  //
  //
  const [isValidLine, setIsValidLine] = useState<boolean>();
  const [steps, setSteps] = useState<string[]>();

  useEffect(() => {
    if (originalTokens.length === 0) return;
    getCodePerLine(originalTokens);
  }, [originalTokens]);

  useEffect(() => {
    if (!activeTokens || !iframeRef.current) return;

    const {
      html = '',
      steps = [],
      isValid = false
    } = allParsers[activeTokens?.[0].tokenType.name]?.(activeTokens) ?? {};
    iframeRef.current.src = html;
    setIsValidLine(isValid);
    setSteps(steps);
    // console.log(html);
  }, [activeTokens]);

  return (
    <div className="grid grid-cols-2 h-full gap-3">
      <div className="grid">
        {/*<Editor*/}
        {/*  className={''}*/}
        {/*  defaultLanguage="super-language"*/}
        {/*  value={transformedCode}*/}
        {/*  options={{ readOnly: true }}*/}
        {/*  theme={'vs'}*/}
        {/*/>*/}
        <Table<IToken[]>
          pagination={{
            size: 'small',
            showQuickJumper: false,
            hideOnSinglePage: false,
            showSizeChanger: false,
            pageSize: 15
            // total: errors.length
          }}
          title={() => <h2>Tokens por linea</h2>}
          bordered
          dataSource={tokensPerLine}
          rowKey={(tokens) => tokens.map((x) => x.image + x.startLine).join('')}
          rowClassName={(_, i) => (selectedRowKey === i ? '!bg-slate-200' : '')}
          onRow={(tokens, i) => {
            return {
              onClick: () => {
                setSelectedRowKey(i);
                setActiveTokens(tokens);
              }
            };
          }}
        >
          <Table.Column title={'Linea'} render={(tokens: IToken[]) => tokens?.[0].startLine}></Table.Column>
          <Table.Column title={'Codigo'} render={(tokens: IToken[]) => tokens.map((x) => x.image).join(' ')} />
          <Table.Column title={'Tokens'} render={(tokens: IToken[]) => tokens.map((x) => x.tokenType.name).join(' ')} />
          <Table.Column<IToken[]>
            title={'Valida'}
            render={(_, tokens) => {
              const evaluateParser = allParsers[tokens[0].tokenType.name];
              if (!evaluateParser) return <></>;
              const { isValid = false } = evaluateParser(tokens);
              if (isValid) return <Check color={'green'} size={16} />;
              return <X color={'red'} size={16} />;
            }}
          />
        </Table>
      </div>
      <div className={'flex flex-col gap-y-3 pb-6'}>
        <div style={{ height: '45vh' }}>
          <h1>Arbol de sintaxis</h1>
          <iframe className={'w-full border-none'} style={{ height: '40vh' }} ref={iframeRef}></iframe>
        </div>
        <div className={'overflow-y-scroll'} style={{ height: '45vh' }}>
          <h1>Proceso de analisis</h1>
          <h2>
            Valido: {isValidLine === false && <X color={'red'} size={16} />}{' '}
            {isValidLine && <Check color={'green'} size={16} />}
          </h2>
          <p>Se busca: {activeTokens?.map((x) => x.tokenType.name).join(' ')}</p>
          {steps?.map((step, index) => <p key={index} dangerouslySetInnerHTML={{ __html: step }}></p>)}
        </div>
      </div>
    </div>
  );
};

export default SyntacticView;
