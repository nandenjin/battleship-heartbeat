/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  context: resolve('src'),
  entry: './index.ts',
  output: {
    path: resolve('dist'),
    filename: '[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin()
  ],
  devtool: 'inline-source-map',
  devServer: {
    port: 3000
  }
}
