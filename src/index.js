import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

document.title = "ChartGuessr";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <div class="centered-div">
      <h1>ChartGuesser</h1>
    </div>
    <App />
  </StrictMode>
);
