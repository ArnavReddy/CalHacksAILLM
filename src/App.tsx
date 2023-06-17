import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';

import './App.module.scss';
import LiveAssistant from './components/LiveAssistant/LiveAssistant';

const App = () => {
  const location = useLocation();

  const urlToken = useMemo(() => {
    return encodeURIComponent(new URLSearchParams(window.location.search).get('token') || '');
  }, [location]);

  const YOUR_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkb2xieS5pbyIsImlhdCI6MTY4NzAyNzA2MSwic3ViIjoibkNWcXpUYVRmOWpUa1ZJSXNzQjVXdz09IiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9DVVNUT01FUiJdLCJ0YXJnZXQiOiJzZXNzaW9uIiwib2lkIjoiZDI2MDNmZGQtYzc4Ny00M2RkLTkyMzctMDFhNWU2ZTIwZmQ0IiwiYWlkIjoiMTljZWU3ZjktMjE2OS00OGU5LTgxNjItZDk3YjE3MTliZmM2IiwiYmlkIjoiOGEzNjgwZGU4OGI0MzMxMjAxODhjYWEwMDcyNDM3YmUiLCJleHAiOjE2ODcxMTM0NjF9.F6Cf2s5r6rLUCMOK_ngkN4VBJ_e1rFoHxFvBh_6J4x1zu59-Nqpse7LiSod8SZIv3qfez0guBhQfS_qmpOA1jQ";

  return (
    // <TranslationProvider>
    //   <ConferenceCreateProvider>
    //     <CommsProvider
    //       token={YOUR_TOKEN} 
    //       packageUrlPrefix={`${window.location.origin}${
    //         import.meta.env.BASE_URL
    //       }assets/wasm`}
    //     >
    //       <ThemeProvider
    //         customThemes={{
    //           'My Theme': { colors: { white: 'yellow', primary: { 400: 'red' }, secondary: { 400: 'blue' } } },
    //         }}
    //       >
    //         <Navigator />
    //       </ThemeProvider>
    //     </CommsProvider>
    //   </ConferenceCreateProvider>
    // </TranslationProvider>
    <LiveAssistant />
  );
};

const container = document.getElementById('root');
// no-non-null-assertion comes from official react docs
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
