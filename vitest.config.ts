import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "modules/**/tests/**/*.test.ts"],
    testTimeout: 60_000,
    globals: true,
  },
});
