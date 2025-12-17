import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GlobalFormaProvider } from "@ehfuse/forma";

createRoot(document.getElementById("root")!).render(
    <GlobalFormaProvider>
        <App />
    </GlobalFormaProvider>
);
