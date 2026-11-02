import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/lib/data-provider";
import JsonFormatter from "./pages/landing";

/** A single client-only workbench, with no server routes or cloud requests. */
const App = () => (
  <BrowserRouter>
    <DataProvider>
      <JsonFormatter />
    </DataProvider>
    <Toaster />
  </BrowserRouter>
);

export default App;
