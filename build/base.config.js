'use strict'
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  resolve: {
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false
        }
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.js$/,
        include: /node_modules\/pdfjs-dist/,
        loader: 'babel-loader'
      }, {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: (loader) => [
                require('autoprefixer')({ remove: false }) // CSS浏览器兼容
              ]
            }
          }
        }, 'sass-loader']
      }
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'vue', 'json'],
      quiet: true
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
}
