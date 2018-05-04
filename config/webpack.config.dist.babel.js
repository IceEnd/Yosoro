import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPluginInstance from 'assets-webpack-plugin';

export default {
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
          use: ['css-loader'],
        }),
      },
      {
        test: /\.scss$/,
        // use: ['style-loader', 'css-loader', 'sass-loader'],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
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
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      path: path.join(__dirname, '../lib'),
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({
      filename: '../lib/[name]_[chunkhash].css',
      allChunks: true,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: 'false',
    }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    //   },
    // }),
    new AssetsPluginInstance({
      filename: 'assets-map.json',
      path: path.join(__dirname, '../lib'),
      prettyPrint: true,
    }),
  ],
};
