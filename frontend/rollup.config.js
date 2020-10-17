import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-node-polyfills";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/file_form.ts",
  output: {
    file: "../django_file_form/static/file_form/file_form.js",
    format: "iife",
    name: "file_form",
    strict: false
  },
  external: ["jquery"],
  plugins: [
    resolve({ browser: true, extensions: [".js", ".ts"] }),
    commonjs(),
    nodePolyfills(),
    babel({
      babelHelpers: "runtime",
      extensions: [".js", ".ts"],
      exclude: "node_modules/core-js/**"
    }),
    terser()
  ]
};
