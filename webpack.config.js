const path = require("path");
const pkg = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const buildPath = "./build/";

module.exports = {
  entry: { index: "./src/app.js" },
  output: {
    path: path.join(__dirname, buildPath),
    filename: "[name].[hash].js",
    publicPath: `/${pkg.repository}/`,
  },
  target: "web",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.obj$/,
        loader: "webpack-obj-loader",
        exclude: path.resolve(__dirname, "./node_modules/"),
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: path.resolve(__dirname, "./node_modules/"),
      },
      {
        test: /\.(jpe?g|png|gif|svg|tga|gltf|glb|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg)$/i,
        use: "file-loader",
        exclude: path.resolve(__dirname, "./node_modules/"),
      },
      {
        test: /\.(vert|frag|glsl|shader|txt)$/i,
        use: "raw-loader",
        exclude: path.resolve(__dirname, "./node_modules/"),
      },
      {
        type: "javascript/auto",
        test: /\.(json)/,
        exclude: path.resolve(__dirname, "./node_modules/"),
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      progress$: path.resolve(__dirname, "src/components/progress"),
      health$: path.resolve(__dirname, "src/components/health"),
      menu$: path.resolve(__dirname, "src/components/menu"),
      virus$: path.resolve(__dirname, "src/components/virus"),
      boss$: path.resolve(__dirname, "src/components/boss"),
      lights$: path.resolve(__dirname, "src/components/lights"),
      objects$: path.resolve(__dirname, "src/components/objects"),
      scenes$: path.resolve(__dirname, "src/components/scenes"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: pkg.title,
      favicon: "src/favicon.ico",
      template: "src/index.html",
    }),
  ],
};
