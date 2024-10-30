import { ConfigProvider } from 'antd';
import { FC, PropsWithChildren } from 'react';
import esEs from 'antd/locale/es_ES';

const ThemeContext: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ConfigProvider
      locale={esEs}
      theme={{
        token: {
          colorPrimaryText: 'rgba(0, 0, 0, 0.85)',
          colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
          colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
          colorPrimary: '#722ED1',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
          colorError: '#dc3545',
          colorInfo: '#722ED1',
          sizeStep: 2,
          sizeUnit: 4,
          wireframe: false,
          borderRadius: 6
        },
        components: {
          Typography: {
            colorText: 'rgba(0, 0, 0, 0.85)',
            colorTextDescription: 'rgba(0, 0, 0, 0.65)',
            colorTextDisabled: 'rgba(0, 0, 0, 0.45)'
          },
          Card: {
            boxShadowTertiary: '0px 1px 2px 0px #00000008,0px 1px 6px -1px #000000050px,2px 4px 0px #00000005'
          },
          Table: {},
          Input: {},
          InputNumber: {},
          Calendar: {},
          Radio: {},
          Select: {}
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeContext;
