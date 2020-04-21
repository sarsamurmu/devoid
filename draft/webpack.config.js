const path = require('path');

module.exports = {
  entry: './hmr/src/app.js',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './hmr/dist',
    hot: true,
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'hmr', 'dist'),
  },
};
