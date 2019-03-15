import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
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
