import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { AppRoot } from "./AppRoot.js";

const container = document.getElementById("root");

if (container) {
    createRoot(container).render(createElement(AppRoot));
}
