import path from 'path';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base.babel';

process.traceDeprecation = true;

export default merge.smart(baseConfig, {
  mode: 'production',
  stats: {
    entrypoints: false,
    children: false,
  },
  entry: {
    index: path.join(__dirname, '../app/views/index.jsx'),
    'webview-pre': path.resolve(__dirname, '../app/webview/webview-pre.js'),
    webview: path.resolve(__dirname, '../app/webview/webview.js'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: 'deps/[name].bundle.js',
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
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
    ],
    occurrenceOrder: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    // 生成html
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../lib/index.html'),
      template: path.resolve(__dirname, '../templete/index.html'),
      inject: true,
      chunks: ['index', 'vendor'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'dependency',
    }),
    // webview html
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../lib/webview.html'),
      template: path.resolve(__dirname, '../templete/webview.html'),
      inject: false,
      chunks: ['webview'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
      },
    }),
    // new BundleAnalyzerPlugin(),
  ],
});
