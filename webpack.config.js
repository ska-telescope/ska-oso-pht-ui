const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require('./package.json').dependencies;
const version = require('./package.json').version;

module.exports = () => {
  return {
    entry: './src/index.jsx',
    output: {},

    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },

    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@utils': path.resolve(__dirname, 'src/utils')
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      fallback: {
        path: require.resolve('path-browserify')
      }
    },

    devServer: {
      port: 6101,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },

    module: {
      rules: [
        {
          test: /\.m?js|\.jsx/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /\.(sass|less|css)$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },

    devtool: 'source-map',

    plugins: [
      new ModuleFederationPlugin({
        name: 'pht',
        filename: 'remoteEntry.js',
        remotes: {},
        exposes: {
          './pht': './src/pages/PHT/PHT.tsx'
        },
        shared: {
          ...deps,
          react: {
            eager: true,
            singleton: true,
            requiredVersion: deps['react']
          },
          'react-dom': {
            eager: true,
            singleton: true,
            requiredVersion: deps['react-dom']
          },
          'react-router': {
            eager: true,
            singleton: true,
            requiredVersion: deps['react-router']
          },
          'react-router-dom': {
            eager: true,
            singleton: true,
            requiredVersion: deps['react-router-dom']
          },
          // i18n
          i18next: {
            eager: true,
            // singleton: true,
            requiredVersion: deps.i18next
          },
          'react-i18next': {
            eager: true,
            // singleton: true,
            requiredVersion: deps['react-i18next']
          },
          'i18next-browser-languagedetector': {
            eager: true,
            singleton: true,
            requiredVersion: deps['i18next-browser-languagedetector']
          },
          'i18next-http-backend': {
            eager: true,
            // singleton: true,
            requiredVersion: deps['i18next-http-backend']
          },
          // Material UI
          '@mui/material': { singleton: true, requiredVersion: deps['@mui/material'], eager: true },
          '@mui/system': { singleton: true, requiredVersion: deps['@mui/system'], eager: true },
          '@mui/x-data-grid': {
            singleton: true,
            requiredVersion: deps['@mui/x-data-grid'],
            eager: true
          },
          '@mui/icons-material': {
            singleton: true,
            requiredVersion: deps['@mui/icons-material'],
            eager: true
          },
          // SKAO components
          '@ska-telescope/ska-gui-components': {
            requiredVersion: deps['@ska-telescope/ska-gui-components'],
            eager: true
          },
          '@ska-telescope/ska-gui-local-storage': {
            requiredVersion: deps['@ska-telescope/ska-gui-local-storage'],
            eager: true
          },
          // mixture
          axios: {
            requiredVersion: deps['axios'],
            eager: true
          },
          '@emotion/react': {
            singleton: true,
            requiredVersion: deps['@emotion/react'],
            eager: true
          },
          '@emotion/styled': {
            singleton: true,
            requiredVersion: deps['@emotion/styled'],
            eager: true
          },
          moment: {
            eager: true,
            singleton: true,
            requiredVersion: deps.moment
          }
        }
      }),
      new HtmlWebPackPlugin({
        template: './public/index.html'
      }),
      new webpack.EnvironmentPlugin({
        REACT_APP_VERSION: version
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: 'dist',
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ['**/*.html']
            }
          }
        ]
      }),
      new Dotenv({
        path: '.env'
      })
    ]
  };
};
