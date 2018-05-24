/**
 * electron 主进程打包
 */
import path from 'path';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default {
  mode: 'production',
  target: 'electron-main',
  devtool: 'source-map',
  externals: [
    'fsevents',
  ],
  entry: {
    main: [
      path.join(__dirname, '../app/main/index.js'),
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../lib'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader',
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  optimization: {
    minimize: true,
  },
  plugins: [],
  node: {
    global: true,
    process: true,
    Buffer: true,
    __dirname: false,
    __filename: false,
  },
};
