import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";

import "./App.module.scss";

import { ColorModeScript } from "@chakra-ui/react";
import { CommsProvider } from "@dolbyio/comms-uikit-react";
import "./App.module.scss";
import TranslationProvider from "./components/TranslationProvider";
import { ConferenceCreateProvider } from "./context/ConferenceCreateContext";
import { Navigator } from "./routes/Navigator";
import theme from "./theme";

const App = () => {
  const location = useLocation();

  const urlToken = useMemo(() => {
    return encodeURIComponent(
      new URLSearchParams(window.location.search).get("token") || ""
    );
  }, [location]);

  const YOUR_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkb2xieS5pbyIsImlhdCI6MTY4NzExNjgzMCwic3ViIjoieHFHSkFBaXo5OURoSzJnTE02OUo2QT09IiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9DVVNUT01FUiJdLCJ0YXJnZXQiOiJzZXNzaW9uIiwib2lkIjoiODBlYjE1NTUtODEwNi00NDBhLThiODQtYThlYTZhYzY5M2RjIiwiYWlkIjoiNTAzNTEyN2UtMzMyOS00MDdjLWI0MmYtNmM5MDI2MmFiYjg4IiwiYmlkIjoiOGEzNjhjZWU4OGI0MzMxYTAxODhjZmZmMWMzODNhOGYiLCJleHAiOjE2ODcyMDMyMzB9.kYIc5RiDoE6OnTyKKTX2y-t1Fuih0rjF-6MLpbyJvZSAqqlgs9BPvCy82t9XIBbant3i7WGri66RSF2yOyU1QA";

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <TranslationProvider>
        <ConferenceCreateProvider>
          <CommsProvider
            token={YOUR_TOKEN}
            packageUrlPrefix={`${window.location.origin}${
              import.meta.env.BASE_URL
            }assets/wasm`}
          >
            <Navigator />
          </CommsProvider>
        </ConferenceCreateProvider>
      </TranslationProvider>
    </>
  );
};

const container = document.getElementById("root");
// no-non-null-assertion comes from official react docs
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
