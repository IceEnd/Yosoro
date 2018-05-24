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
  entry: [
    'whatwg-fetch',
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, '../app/views/index.jsx'),
  ],
  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: 'js/bundle.js',
    publicPath: 'http://localhost:3000/static/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          'react-hot-loader/webpack',
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, '../app/renderer'),
    publicPath: 'http://localhost:3000/static/',
    port: 3000,
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: {
      colors: true, // Nice colored output
      progress: true,
      inline: true,
      noInfo: true,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
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
