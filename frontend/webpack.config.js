const path = require("path");

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const coverage = Boolean(process.env.COVERAGE);

const minimize = !skipCompressJs && !coverage;

const getOutputFilename = () => {
    if (coverage) {
        return "file_form.coverage.js";
    } else if (skipCompressJs) {
        return "file_form.debug.js";
    } else {
        return "file_form.js";
    }
};

module.exports = {
  entry: {
    file_form: ["./src/file_form.ts"]
  },
  output: {
    path: path.resolve(__dirname, "../django_file_form/static/file_form/"),
    filename: getOutputFilename(),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      coverage && {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
              loader: "@jsdevtools/coverage-istanbul-loader",
              options: { esModules: true },
          },
          enforce: "post",
      },
    ].filter(Boolean),
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
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
