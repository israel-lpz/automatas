import { Layout, Tabs, TabsProps } from 'antd';
import LexerView from '@renderer/components/lexer_view';
import SyntacticView from '@renderer/components/syntactic_view';
import { useState } from 'react';
import SemanticView from '@renderer/components/semantic_view';

const tabs: TabsProps['items'] = [
  {
    key: '1',
    label: 'Lexico',
    children: <LexerView />,
    forceRender: true
  },
  {
    key: '2',
    label: 'Sintactico',
    children: <SyntacticView />,
    forceRender: true
  },
  {
    key: '3',
    label: 'Semantico',
    children: <SemanticView />,
    forceRender: true
  },
  {
    key: '6',
    label: 'Ensamblador',
    children: <div>6</div>,
    disabled: true,
    forceRender: true
  }
];

const App = () => {
  const [active, setActive] = useState('1');

  return (
    <Layout className={'h-dvh p-3'}>
      <main className={'h-full'}>
        <Tabs items={tabs} className={'h-full'} rootClassName={'h-full'} activeKey={active} onChange={setActive} />
      </main>
    </Layout>
  );
};

export default App;
