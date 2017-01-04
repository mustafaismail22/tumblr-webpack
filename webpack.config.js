const path = require('path')
const glob = require('glob')
// const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const autoprefixer = require('autoprefixer')

const debug = process.env.NODE_ENV !== 'production'
const rootPath = path.join(__dirname, 'src')
const flieNameFormat = `[name]${!debug ? '-[hash:6]' : ''}`
const PATHS = {
  html: '',
  css: 'assets/css/',
  js: 'assets/js/',
  files: 'assets/files/',
  fonts: 'assets/fonts/'
}

const plugins = [
  new BrowserSyncPlugin({
    host: 'localhost',
    port: 8080,
    files: 'build/assets/**/*',
    server: {
      baseDir: 'build',
      directory: true
    }
  }, { reload: false })
]

glob.sync(path.join(rootPath, '*.html')).forEach(p => {
  plugins.push(new HtmlWebpackPlugin({
    filename: PATHS.html + path.basename(p),
    template: p,
    inject: false,
    paths: PATHS
  }))

  plugins.push(new HtmlWebpackPlugin({
    filename: PATHS.html + path.basename(p, path.extname(p)) + '-tumblr' + path.extname(p),
    template: '!!ejs!' + p,
    inject: false,
    paths: PATHS
  }))
})

// if (!debug) {
//   plugins.push(new webpack.optimize.DedupePlugin())
//   plugins.push(new webpack.optimize.OccurenceOrderPlugin())
//   plugins.push(new webpack.optimize.UglifyJsPlugin({
//     exclude: /\.html$/,
//     beautify: true,
//     compressor: {
//       warnings: false
//     }
//   }))
// }

const config = () => ({
  context: rootPath,
  entry: {
    'main': './' + PATHS.js + 'main.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: `${PATHS.js}${flieNameFormat}.js`,
    chunkFilename: PATHS.js + '[name]-[hash:6]-[id].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['', '.js', '.json']
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        loaders: [
          'babel-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.html$/,
        loaders: [
          // 'raw',
          `append-loader?content=${encodeURIComponent('\n var ejs = module.exports; \n module.exports = function (obj) {\n var html = ejs(obj); \n return compile(html, data); \n};\n')}`,
          `imports-loader?tumblrParser=tumblr-theme-parser,compile=>tumblrParser.compile,data=${path.join(rootPath, 'data.json')}`,
          'ejs'
          // 'html-loader?interpolate&attrs=false'
        ]
      },
      {
        test: /\.(css|scss|sass)$/,
        loaders: [
          `file-loader?name=${PATHS.css}${flieNameFormat}.css`,
          'extract-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|eot|otf|woff2?|ttf)$/,
        loader: `file-loader?name=${PATHS.fonts}[name]-[hash:6].[ext]`
      },
      {
        test: /\.(ico|pdf|jpe?g|gif|png|mp4|webm)$/,
        loader: `file-loader?name=${PATHS.files}[name]-[hash:6].[ext]`
      }
    ],
    noParse: /\.min\.js$/
  },
  postcss: () => [
    autoprefixer
  ],
  svgoConfig: {
    plugins: [
      {sortAttrs: true},
      {removeTitle: true},
      {removeDimensions: true}
    ]
  },
  plugins: plugins,
  debug: debug
})

module.exports = config()
module.exports.config = config

if (debug) {
  console.log('++++++++++++++++++++++++++++++++++++++')
  console.log('+++++++++++ WEBPACK CONFIG +++++++++++')
  console.log('++++++++++++++++++++++++++++++++++++++')
  console.dir(module.exports, {depth: 1, colors: true})
  console.log('++++++++++++++++++++++++++++++++++++++')
  console.log('++++++++++++++++++++++++++++++++++++++\n')
}
