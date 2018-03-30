import path from 'path';
import webpack from 'webpack';
// import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default {
  target: 'electron-renderer',
  node: {
    fs: 'empty',
  },
  context: path.resolve(__dirname, '../app/views'),
  entry: [
    'whatwg-fetch',
    'react-hot-loader/patch',
    // 'webpack-dev-server/client?http://localhost:3000/',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, '../app/views/index.jsx'),
  ],
  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: 'js/bundle.js',
    publicPath: 'http://localhost:3000/static/',
    // hotUpdateChunkFilename: 'hot/hot-update.js',
    // hotUpdateMainFilename: 'hot/hot-update.json',
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
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          'react-hot-loader/webpack',
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    browsers: ['last 2 versions', 'safari >= 7'],
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: 'css-loader',
        // }),
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
  devtool: 'cheap-eval-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //   },
    // }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // new ExtractTextPlugin('styles.css'),
  ],
};
