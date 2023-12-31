import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const includeCoverage = Boolean(process.env.COVERAGE);

const getOutputFilename = () => {
  if (includeCoverage) {
    return "file_form.coverage.js";
  } else if (skipCompressJs) {
    return "file_form.js";
  } else {
    return "file_form.min.js";
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
    exclude: /node_modules\/(?!tus-js-client)/,
    extensions: [".js", ".ts"]
  })
];

if (minimize) {
  const terserPlugin = terser();
  plugins.push(terserPlugin);
}

export default {
  moduleContext: {
    "node_modules/mime/dist/src/Mime.js": "window" // Fix 'this is undefined' error in the mime package
  },
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
