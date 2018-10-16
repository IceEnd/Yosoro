import path from 'path';

export default {
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader?limit=10000&name=images/[name].[ext]',
      },
      {
        test: /\.(eot|woff(2)?|ttf)$/,
        loader: 'url-loader?limit=10000&name=fonts/[name].[ext]',
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
};
