const esbuild = require("esbuild");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

const sharedConfig = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    external: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "swr",
        "@ehfuse/api-client",
        "@ehfuse/alerts",
        "@ehfuse/forma",
    ],
};

async function build() {
    try {
        // TypeScript 타입 정의 생성
        console.log("Generating TypeScript declarations...");
        await execAsync("tsc --emitDeclarationOnly --outDir dist");

        // ESM 빌드
        console.log("Building ESM bundle...");
        await esbuild.build({
            ...sharedConfig,
            format: "esm",
            outfile: "dist/index.esm.js",
        });

        // CJS 빌드
        console.log("Building CJS bundle...");
        await esbuild.build({
            ...sharedConfig,
            format: "cjs",
            outfile: "dist/index.js",
        });

        console.log("Build completed successfully!");
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

build();
