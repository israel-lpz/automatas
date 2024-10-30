import MonacoEditor from '@renderer/components/MonacoEditor';
import { Table } from 'antd';
import { Editor } from '@monaco-editor/react';
import { IVariables, useCodeStore } from '@renderer/context/codeContext';
import { IRecognitionException } from 'chevrotain';

const LexerView = () => {
  const transformedCode = useCodeStore((state) => state.transformedCode);
  const errors = useCodeStore((state) => state.errors);
  const variables = useCodeStore((state) => state.variables);

  return (
    <div className="grid grid-cols-2 h-full gap-3">
      <MonacoEditor />
      <div className={'grid grid-rows-3 gap-y-3'}>
        <Table<IVariables>
          pagination={{
            size: 'small',
            showQuickJumper: false,
            hideOnSinglePage: false,
            showSizeChanger: false,
            pageSize: 4,
            total: errors.length
          }}
          title={() => <h2>Simbolos</h2>}
          bordered
          dataSource={variables}
          rowKey={({ value, name, type }) => value + name + type}
        >
          <Table.Column title={'Simbolo'} dataIndex={'name'}></Table.Column>
          <Table.Column title={'Tipo'} dataIndex={'type'}></Table.Column>
          <Table.Column title={'Valor'} dataIndex={'value'}></Table.Column>
        </Table>
        <Table<IRecognitionException>
          title={() => <h2>Errores</h2>}
          dataSource={errors}
          bordered
          pagination={{
            size: 'small',
            showQuickJumper: false,
            hideOnSinglePage: false,
            showSizeChanger: false,
            pageSize: 4,
            total: errors.length
          }}
          rowKey={(record) => record.message + record.token.image}
        >
          <Table.Column title={'Error'} dataIndex={'message'}></Table.Column>
          <Table.Column title={'Linea'} dataIndex={['token', 'startLine']}></Table.Column>
          <Table.Column title={'Columna'} dataIndex={['token', 'startColumn']}></Table.Column>
        </Table>
        <Editor
          className={''}
          defaultLanguage="super-language"
          value={transformedCode}
          options={{ readOnly: true }}
          theme={'vs'}
        />
      </div>
    </div>
  );
};

export default LexerView;
