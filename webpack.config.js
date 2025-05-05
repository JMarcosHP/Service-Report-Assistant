const path = require('path');

module.exports = {
  entry: './src/electron/main.js',
  output: {
    path: path.resolve(__dirname, '.webpack/main'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
};