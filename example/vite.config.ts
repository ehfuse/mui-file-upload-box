import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
        }),
    ],
    resolve: {
        alias: {
            "@ehfuse/mui-fileupload": path.resolve(__dirname, "../src"),
            "@emotion/react": path.resolve(
                __dirname,
                "node_modules/@emotion/react"
            ),
            "@emotion/styled": path.resolve(
                __dirname,
                "node_modules/@emotion/styled"
            ),
            react: path.resolve(__dirname, "node_modules/react"),
            "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        },
    },
    optimizeDeps: {
        include: [
            "@emotion/react",
            "@emotion/styled",
            "@mui/material",
            "@mui/icons-material",
            "react",
            "react-dom",
        ],
    },
});
