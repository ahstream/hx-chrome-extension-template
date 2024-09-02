/* eslint-disable */

const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');

const base = {
  entry: {
    serviceWorker: './src/background/serviceWorker.js',
    statusbar: './src/statusbar/statusbar.js',
    popup: './src/pages/popup/popup.js',
    options: './src/pages/options/options.js',
    storage: './src/pages/storage/storage.js',
    sandbox: './src/pages/sandbox/sandbox.js',
    sandbox2: './src/pages/sandbox2/sandbox2.js',
    toc: './src/pages/toc/toc.js',
    shortcuts: './src/pages/shortcuts/shortcuts.js',
    samplePage: './src/pages/samplePage/samplePage.js',
    example: './src/contentScripts/example.js',
  },
  output: {
    filename: '[name].js',
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: path.resolve(__dirname, 'dist/'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      fs: false,
      tls: false,
      net: false,
      child_process: false,
      stream: require.resolve('readable-stream'),
    },
    alias: {
      '@': path.resolve(__dirname),
      '@src': path.resolve(__dirname, 'src'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ogg|mp3|wav)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ESLintPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyPlugin({ patterns: [{ from: 'src/manifest.json' }] }),
    new CopyPlugin({ patterns: [{ from: 'src/assets/images/', to: 'images/' }] }),
    new CopyPlugin({ patterns: [{ from: 'src/pages/**/*.html', to: '[name][ext]' }] }),
    new NodePolyfillPlugin(),
    new Dotenv(),
  ],
};

const dev = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: 'dist',
    devMiddleware: {
      writeToDisk: true,
    },
  },
};

const prod = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: undefined,
          parse: {},
          compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          // Deprecated
          output: null,
          format: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        },
      }),
    ],
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    const config = merge(base, dev);
    console.log('argv.mode:', argv.mode);
    console.log('config.mode:', config.mode);
    return config;
  }
  if (argv.mode === 'production') {
    console.log('production');
    const config = merge(base, prod);
    console.log('argv.mode:', argv.mode);
    console.log('config.mode:', config.mode);
    return config;
  }
  console.error('Unsupported mode:', argv.mode);
  return null;
};
