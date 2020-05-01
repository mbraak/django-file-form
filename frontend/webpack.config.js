const path = require("path");

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);

const minimize = !skipCompressJs;
const outputFilename = skipCompressJs ? "file_form.debug.js" : "file_form.js";

module.exports = {
  entry: {
    file_form: ["./src/file_form.ts"]
  },
  output: {
    path: path.resolve(__dirname, "../django_file_form/static/file_form/"),
    filename: outputFilename
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  devtool: "source-map",
  optimization: {
    minimize
  },
  externals: {
    jquery: "jQuery"
  }
};
