import ReactDOM from "react-dom/client";
import AppShell from "./app-shell";
import { HashRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import appTheme from "./theme/app-theme";
import "./global-styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    <HashRouter>
      <AppShell />
    </HashRouter>
  </ThemeProvider>
);
