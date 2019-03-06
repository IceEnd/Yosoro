import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base.babel';

export default merge.smart(baseConfig, {
  mode: 'development',
  node: {
    fs: 'empty',
  },
  context: path.resolve(__dirname, '../app/views'),
  entry: {
    'js/bundle': [
      'react-hot-loader/patch',
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, '../app/views/index.jsx'),
    ],
    'webview/webview-pre': [
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, '../app/webview/webview-pre.js'),
    ],
    'webview/webview': [
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, '../app/webview/webview.js'),
    ],
  },
  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'http://localhost:3000/static/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          // 'react-hot-loader/webpack',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, '../app/renderer'),
    publicPath: 'http://localhost:3000/static/',
    port: 3000,
    compress: true,
    noInfo: true,
    inline: true,
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devtool: 'cheap-eval-source-map',
  optimization: {
    occurrenceOrder: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
});
