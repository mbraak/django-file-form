const path = require("path");

module.exports = {
    entry: {
        file_form: ["./file_form.js"]
    },
    output: {
        path: path.resolve(
            __dirname,
            "../django_file_form/static/file_form/"
        ),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    externals: {
        jquery: "jQuery"
    }
};
