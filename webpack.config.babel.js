import webpack from "webpack";
import path from "path";
import BabiliPlugin from "babili-webpack-plugin";
const SOURCE = path.join(__dirname, "src");
const DESTINATION = path.join(__dirname, "dist");
const ENV = process.env.NODE_ENV;
const isDebug = ENV === "development";
const mode = "production";

export default {
  context: __dirname,
  entry: {
    index: "./src",
  },
  mode: mode,
  output: {
    path: DESTINATION,
    publicPath: ".",
    filename: "[name].js",
    chunkFilename: "[name]-[chunkhash].js",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: SOURCE,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.dat$/,
        use: "binary-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devtool: isDebug ? "inline-sourcemap" : false,
  plugins: isDebug
    ? []
    : [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new BabiliPlugin(),
      ],
};
