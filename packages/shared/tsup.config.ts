import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  outExtension: ({ format }) => ({
    js: format === "cjs" ? ".js" : ".mjs",
  }),
});
