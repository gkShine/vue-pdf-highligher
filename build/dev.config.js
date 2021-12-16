'use strict'

const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'development',

  entry: {
    app: ['./example/main.js']
  },
  module: {
    rules: [
      {
        test: /\.pdf$/,
        loader: 'url-loader'
      }
    ]
  },
  devServer: {
    hot: true,
    watchFiles: [path.join(__dirname, '../example'), path.join(__dirname, '../dist')],
    compress: true,
    host: '0.0.0.0',
    port: '8082',
    open: false,
    static: path.join(__dirname, '../example')
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'example/index.html',
      inject: true,
      collapseWhitespace: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
})
