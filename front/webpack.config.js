/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: '../.env' })
const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  context: resolve('src'),
  entry: './index.ts',
  output: {
    path: resolve('dist'),
    filename: '[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
  },
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      FIREBASE_CONFIG: process.env.FIREBASE_CONFIG || '{}',
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new HtmlWebpackPlugin(),
  ],
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
}
