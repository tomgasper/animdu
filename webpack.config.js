const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js', // Punkt wejścia aplikacji
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Obsługa plików TypeScript
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/, // Obsługa plików JavaScript i JSX
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'], // Rozszerzenia plików do rozpatrzenia
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*.png', 
          to: path.resolve(__dirname, 'dist/src'),
          context: 'src',
        },
      ],
    }),
  ],
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    open: true
  }
};
