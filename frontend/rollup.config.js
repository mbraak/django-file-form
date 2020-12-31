import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import coverage from "rollup-plugin-istanbul2";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const includeCoverage = Boolean(process.env.COVERAGE);

const minimize = !skipCompressJs && !includeCoverage;

const getOutputFilename = () => {
  if (includeCoverage) {
    return "file_form.coverage.js";
  } else if (skipCompressJs) {
    return "file_form.debug.js";
  } else {
    return "file_form.js";
  }
};

const plugins = [
  resolve({ browser: true, extensions: [".js", ".ts"] }),
  commonjs(),
  babel({
    babelHelpers: "runtime",
    extensions: [".js", ".ts"],
    exclude: "node_modules/core-js/**"
  })
];

if (minimize) {
  const terserPlugin = terser();
  plugins.push(terserPlugin);
}

if (includeCoverage) {
  const coveragePlugin = coverage({
    exclude: ["node_modules/**"]
  });
  plugins.push(coveragePlugin);
}

export default {
  input: "src/file_form.ts",
  output: {
    file: `../django_file_form/static/file_form/${getOutputFilename()}`,
    format: "iife",
    name: "file_form",
    sourcemap: true,
    strict: false
  },
  plugins
};
