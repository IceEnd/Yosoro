import path from 'path';
import merge from 'webpack-merge';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig from './webpack.config.base.babel';

process.traceDeprecation = true;

const extractTextConf = (loaders = []) => ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [
    {
      loader: 'css-loader',
      options: { minimize: true },
    },
    ...loaders,
  ],
});

export default merge.smart(baseConfig, {
  mode: 'production',
  entry: {
    index: path.join(__dirname, '../app/views/index.jsx'),
    vendor: ['react', 'react-dom', 'redux', 'redux-saga', 'redux-logger', 'history', 'prop-types', 'antd', 'whatwg-fetch'],
    'webview/webview-pre': [
      path.resolve(__dirname, '../app/webview/webview-pre.js'),
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../lib'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
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
      {
        test: /\.css$/,
        use: extractTextConf(),
      },
      {
        test: /\.scss$/,
        use: extractTextConf(['sass-loader']),
      },
    ],
  },
  optimization: {
    minimize: true,
    occurrenceOrder: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'vendor',
          test: /react|react-dom|redux|redux-saga|redux-logger|history|prop-types|antd|whatwg-fetch/,
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      allChunks: true,
    }),
    // 生成html
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../lib/index.html'),
      template: path.resolve(__dirname, '../templete/index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'dependency',
    }),
    // webview html
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../lib/webview/webview.html'),
      template: path.resolve(__dirname, '../app/main/webview/webview.html'),
      inject: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
      },
    }),
  ],
});
