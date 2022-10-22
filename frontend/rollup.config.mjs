import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "@el3um4s/rollup-plugin-terser";

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const includeCoverage = Boolean(process.env.COVERAGE);

const getOutputFilename = () => {
  if (includeCoverage) {
    return "file_form.coverage.js";
  } else if (skipCompressJs) {
    return "file_form.debug.js";
  } else {
    return "file_form.js";
  }
};

const minimize = !skipCompressJs && !includeCoverage;
const babelConfigFile = includeCoverage
  ? "./babel.coverage.config.json"
  : "./babel.config.json";

const plugins = [
  resolve({ browser: true, extensions: [".js", ".ts"] }),
  commonjs(),
  babel({
    babelHelpers: "runtime",
    configFile: babelConfigFile,
    extensions: [".js", ".ts"],
    exclude: ["node_modules/core-js/**", "node_modules/**/core-js*/**"]
  })
];

if (minimize) {
  const terserPlugin = terser();
  plugins.push(terserPlugin);
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
