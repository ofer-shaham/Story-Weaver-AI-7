import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? process.env.PORT ?? 8080);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "off",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm run build && pnpm run start",
        cwd: ".",
        port: PORT,
        env: { PORT: String(PORT) },
        reuseExistingServer: true,
        timeout: 60_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
