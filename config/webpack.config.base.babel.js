import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const miniCssLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: {
    publicPath: process.env.NODE_ENV === 'production' ? '../' : '../../',
  },
};

export default {
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]',
          outputPath: 'images/',
        },
      },
      {
        test: /\.css$/,
        use: [
          { ...miniCssLoader },
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          { ...miniCssLoader },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          { ...miniCssLoader },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
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
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
};
