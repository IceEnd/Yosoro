/**
 * electron 主进程打包
 */
import path from 'path';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';

export default {
  target: 'electron-main',
  devtool: 'source-map',
  externals: [
    'fsevents',
  ],
  entry: {
    main: [
      'babel-polyfill',
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
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    electron: '1',
                  },
                }],
              ],
            },
          },
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  plugins: [
    new UglifyJSPlugin({
      parallel: true,
      sourceMap: true,
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //   },
    // }),
    // new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    //   },
    // }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: 'false',
    }),
    // new BundleAnalyzerPlugin(),
  ],
  node: {
    global: true,
    process: true,
    Buffer: true,
    __dirname: false,
    __filename: false,
  },
};
