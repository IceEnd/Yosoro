import path from 'path';
// import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';


process.traceDeprecation = true;

export default {
  mode: 'production',
  target: 'electron-renderer',
  devtool: 'source-map',
  entry: {
    index: path.join(__dirname, '../app/views/index.jsx'),
    vendor: ['react', 'react-dom', 'prop-types', 'antd', 'whatwg-fetch'],
  },
  output: {
    filename: '[name]_[hash].js',
    path: path.resolve(__dirname, '../lib'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          'babel-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    browsers: ['last 2 versions', 'chrome >= 59'],
                  },
                  loose: true,
                }],
                ['react'],
                ['stage-0'],
              ],
              plugins: ['transform-object-assign'],
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../'),
      },
      {
        test: /\.css$/,
        // use: ['style-loader', 'css-loader'],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: { minimize: true },
          }],
        }),
      },
      {
        test: /\.scss$/,
        // use: ['style-loader', 'css-loader', 'sass-loader'],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // use: ['css-loader', 'sass-loader'],
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true },
            },
            {
              loader: 'sass-loader',
            },
          ],
        }),
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader?limit=10000&name=images/[name].[ext]',
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg)$/,
        loader: 'url-loader?name=fonts/[name].[ext]',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimize: true,
    occurrenceOrder: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'vendor',
          test: /react|react-dom|prop-types|antd|whatwg-fetch/,
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name]_[chunkhash].css',
      allChunks: true,
    }),
    // 生成html
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../lib/index.html'),
      template: path.resolve(__dirname, '../index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'dependency',
    }),
  ],
};
