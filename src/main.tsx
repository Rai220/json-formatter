import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installPaletteVars } from "@/lib/palette";
import "./index.css";
import "./base.css";
import "./style-pack.css";
import "./tints.css";
import "./motion.css";

// Publish the card palette as CSS variables so the Tailwind color tokens resolve.
installPaletteVars();

let theme = "system";
try { theme = localStorage.getItem("theme") ?? "system"; } catch { /* Browser storage is optional. */ }
if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
