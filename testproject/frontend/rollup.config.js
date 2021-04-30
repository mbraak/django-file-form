import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/example_form_custom_widget.js",
  output: {
    file: "../django_file_form_example/static/example_form_custom_widget.js",
    format: "iife",
    name: "example_form_custom_widget",
  },
  plugins: [
    replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
    resolve(),
    commonjs({ exclude: "src/**" }),
    babel({ babelHelpers: "bundled" }),
  ],
};
