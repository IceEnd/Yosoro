import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const extractTextConf = (loaders = []) => ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [
    {
      loader: 'css-loader',
      options: {
        minimize: process.env.NODE_ENV !== 'development',
      },
    },
    ...loaders,
  ],
});

export default {
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader?limit=10000&name=images/[name].[ext]',
      },
      {
        test: /\.css$/,
        use: extractTextConf(),
      },
      {
        test: /\.scss$/,
        use: extractTextConf(['sass-loader']),
      },
      {
        test: /\.less$/,
        use: extractTextConf([{
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
          },
        }]),
      },
      {
        test: /\.(eot|woff(2)?|ttf)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/',
          publicPath: '../../fonts',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['node_modules', 'app'],
    alias: {
      Components: path.resolve(__dirname, '../app/views/component/'),
      Share: path.resolve(__dirname, '../app/views/component/share'),
      Utils: path.resolve(__dirname, '../app/views/utils/'),
      Actions: path.resolve(__dirname, '../app/views/actions/'),
      Services: path.resolve(__dirname, '../app/views/services/'),
      Assets: path.resolve(__dirname, '../app/views/assets'),
      Config: path.resolve(__dirname, '../app/views/config'),
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      allChunks: true,
    }),
  ],
};
